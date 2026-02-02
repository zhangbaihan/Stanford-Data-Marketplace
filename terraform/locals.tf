# locals.tf
# Defines local values for derivations and common expressions

locals {
  api_domain_name = "api.${var.domain_name}"
}
