# SEES Core App - hooks.py
# This file enforces the Subscription Tiers (Phase 1)

app_name = "sees_core"
app_title = "SEES Core"
app_publisher = "SEES"
app_description = "Core logic for SEES SaaS Multi-tenant Tier Enforcement"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "support@sees.app"
app_license = "MIT"

# Hook into standard Frappe events to enforce limits
doc_events = {
    "*": {
        "has_permission": "sees_core.sees_core.api.check_tier_permission"
    }
}

# Define Tier Limits centrally here or in a Custom DocType
SEES_TIERS = {
    "starter": {
        "allowed_modules": ["Accounts", "CRM", "Setup"],
        "max_users": 5
    },
    "growth": {
        "allowed_modules": ["Accounts", "CRM", "Setup", "HR", "Stock"],
        "max_users": 20
    },
    "enterprise": {
        "allowed_modules": ["*"], # All standard ERPNext modules
        "max_users": 9999
    }
}
