import frappe
from frappe import _

# 1. Tier Enforcement (Phase 1)
def check_tier_permission(doc, ptype, user):
    """
    Called on every document access (Read/Write).
    Checks if the document belongs to a module allowed in the current tenant's tier.
    """
    if "Administrator" in frappe.get_roles(user):
        return True # Admin can access everything
    
    # Get current tenant's tier from site config
    current_tier = frappe.conf.get("sees_tier") or "starter"
    
    # Fetch allowed modules from our central hooks mapping
    from sees_core.sees_core.hooks import SEES_TIERS
    tier_config = SEES_TIERS.get(current_tier)
    
    if "*" in tier_config["allowed_modules"]:
        return True
        
    doc_module = frappe.db.get_value("DocType", doc.doctype, "module")
    
    if doc_module not in tier_config["allowed_modules"]:
        frappe.throw(_("Your current plan ({0}) does not include access to the {1} module. Please upgrade via the SEES Control Plane.").format(current_tier, doc_module))
        return False
        
    return True


# 2. Event Streaming / Data Export API (Phase 1 prep for Phase 3/4)
def publish_event(doc, method):
    """
    Triggered on document submission (e.g. Sales Invoice, Journal Entry).
    Pushes data to an external Kafka/EventBridge queue for the Data Warehouse.
    """
    if frappe.conf.get("sees_event_streaming_enabled"):
        # Format document into standard JSON payload
        payload = {
            "tenant_id": frappe.local.site,
            "doctype": doc.doctype,
            "docname": doc.name,
            "event_type": method,
            "data": doc.as_dict()
        }
        
        # Here we would enqueue this payload to Redis/Celery 
        # which then reliably pushes to Kafka/AWS EventBridge
        frappe.enqueue(
            "sees_core.sees_core.jobs.push_to_message_broker",
            queue="short",
            payload=payload
        )
