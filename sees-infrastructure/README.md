# SEES Infrastructure & Control Plane

This repository contains the infrastructure configuration and control plane services for the SEES Phase 1 SaaS platform.

## Directory Structure

*   `/kubernetes`: Contains Helm values and Kubernetes manifests for deploying the multi-tenant Frappe/ERPNext cluster.
    *   `frappe-values.yaml`: The core configuration for the official Frappe Helm chart, optimized for multi-tenancy.
*   `/control-plane`: (To be scaffolded) The Next.js service responsible for:
    *   Handling Stripe checkouts and webhooks.
    *   Executing tenant onboarding jobs (creating Frappe sites).
    *   Communicating with the SEES Core App on tenant sites to enforce tier limits.

## Deployment Instructions (Phase 1)

1.  **Provision Cluster:** Provision a Kubernetes cluster (EKS/GKE/AKS).
2.  **Install Ingress & Cert Manager:** Ensure NGINX Ingress Controller and Cert Manager are running.
3.  **Deploy Frappe:**
    ```bash
    helm repo add frappe https://helm.erpnext.com
    helm install sees-erpnext frappe/erpnext -f kubernetes/frappe-values.yaml
    ```
4.  **Deploy Control Plane:** (Instructions to follow once scaffolded)
