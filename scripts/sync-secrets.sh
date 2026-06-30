#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env}"

if [[ ! -f "$env_file" ]]; then
  echo "Missing env file: $env_file" >&2
  exit 1
fi

secrets=(
  SMTP_USER
  SMTP_PASSWORD
  GCP_SA_KEY
  RECAPTCHA_SECRET_KEY
)

variables=(
  FUNCTION_NAME
  FUNCTION_REGION
  MAIL_TO
  MAIL_SUBJECT
  MAIL_TITLE
  SMTP_HOST
  SMTP_PORT
  RECAPTCHA_SITE_KEY
  RECAPTCHA_MIN_SCORE
  RECAPTCHA_EXPECTED_ACTION
)

synced=0

get_env() {
  local key="$1"

  awk -v key="$key" '
    function strip_quotes(value) {
      quote = sprintf("%c", 39)

      if (substr(value, 1, 1) == "\"" && substr(value, length(value), 1) == "\"") {
        return substr(value, 2, length(value) - 2)
      }

      if (substr(value, 1, 1) == quote && substr(value, length(value), 1) == quote) {
        return substr(value, 2, length(value) - 2)
      }

      return value
    }

    $0 ~ "^[[:space:]]*" key "=" {
      value = $0
      sub("^[[:space:]]*" key "=", "", value)

      if (key == "GCP_SA_KEY" && value ~ /^[[:space:]]*[{]/) {
        print value

        while ((getline line) > 0) {
          print line

          if (line ~ /^[[:space:]]*}[[:space:]]*$/) {
            exit
          }
        }
      } else {
        print strip_quotes(value)
      }

      exit
    }
  ' "$env_file"
}

sync_secret() {
  local key="$1"
  local value
  value="$(get_env "$key")"

  if [[ "$key" == "GCP_SA_KEY" ]]; then
    local key_file
    key_file="$(get_env GCP_SA_KEY_FILE)"

    if [[ -n "$key_file" ]]; then
      gh secret set "$key" < "$key_file"
      echo "Synced secret $key from $key_file"
      synced=$((synced + 1))
      return
    fi
  fi

  if [[ -z "$value" ]]; then
    return
  fi

  printf '%s' "$value" | gh secret set "$key"
  echo "Synced secret $key"
  synced=$((synced + 1))
}

sync_variable() {
  local key="$1"
  local value
  value="$(get_env "$key")"

  if [[ -z "$value" ]]; then
    return
  fi

  gh variable set "$key" --body "$value"
  echo "Synced variable $key"
  synced=$((synced + 1))
}

for key in "${secrets[@]}"; do
  sync_secret "$key"
done

for key in "${variables[@]}"; do
  sync_variable "$key"
done

echo "Done. Synced $synced filled value(s) from $env_file."
