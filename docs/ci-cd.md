# FashionWeb CI/CD Guide

## Overview

This repository uses GitHub Actions to provide:

- Continuous Integration on every push and pull request
- Automated deployment to the production EC2 environment after CI succeeds
- Slack notifications for CI and CD state changes
- Static analysis and dependency security checks
- Infrastructure validation for Docker Compose based deployments

## Workflows

### 1. CI

File: `.github/workflows/ci.yml`

Runs on:

- every push
- pull requests targeting `main`
- manual dispatch

Checks included:

- backend install, typecheck, tests, build
- frontend install, typecheck, tests, build
- Docker Compose configuration validation
- production dependency audit
- dependency review on pull requests

### 2. CD

File: `.github/workflows/deploy.yml`

Runs on:

- successful completion of `FashionWeb CI` for the `main` branch
- manual dispatch

Deployment behavior:

- connects to the EC2 host over SSH
- clones the repository if it does not exist yet
- resets to the latest `origin/main`
- writes `backend/.env` from a protected GitHub secret
- runs `scripts/deploy-prod.sh`
- verifies `/api/health` and frontend availability

### 3. CodeQL

File: `.github/workflows/codeql.yml`

Runs on:

- pushes to `main`
- pull requests to `main`
- weekly schedule

### 4. Dependabot

File: `.github/dependabot.yml`

Keeps npm and GitHub Actions dependencies updated automatically.

## Required GitHub Secrets

Configure these in **GitHub Settings -> Secrets and variables**.

### Repository or Environment Secrets

- `SSH_HOST`: production EC2 public IP or DNS
- `SSH_USERNAME`: SSH user, for example `ubuntu`
- `SSH_KEY`: private SSH key for deployment
- `SSH_PORT`: optional, defaults to `22`
- `SSH_FINGERPRINT`: optional but recommended for host verification
- `EC2_DEPLOY_PATH`: absolute path on the server, for example `/home/ubuntu/FashionWeb`
- `BACKEND_ENV_FILE`: full production backend `.env` content
- `SLACK_WEBHOOK_URL`: optional, enables Slack notifications

### Recommended GitHub Variables

- `PRODUCTION_URL`: public URL of the production environment

## Example BACKEND_ENV_FILE secret

```env
DATABASE_URL="postgresql://user:password@db-host:5432/fashion?sslmode=require"
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=http://YOUR_PUBLIC_DOMAIN_OR_IP
```

## GitHub Environment Protection

Create a GitHub environment named `production` and configure:

- required reviewers for deployment approvals
- environment-scoped secrets instead of plain repository secrets
- deployment branch restrictions for `main`

This is not stored in code and must be configured in GitHub UI.

## AWS EC2 Requirements

Install the following on the server:

- Docker
- Docker Compose
- Git
- Curl

Make sure the AWS Security Group allows:

- `22/tcp` for SSH
- `80/tcp` for HTTP

Backend port `5000` does not need public exposure when using the included Nginx reverse proxy.

## Slack Notifications

The workflows send Slack notifications when:

- CI finishes
- CD starts
- CD succeeds
- CD fails

If `SLACK_WEBHOOK_URL` is not configured, the workflows continue without notifications.

## Local Validation

Before pushing, run:

```bash
cd backend
npm run ci

cd ../frontend
npm run ci
```

## Full Pipeline Smoke Test

After secrets and environment protection are configured:

1. Create a small commit
2. Push it to a feature branch to validate CI
3. Merge to `main` to trigger CD
4. Confirm:
   - CI is green
   - CD is green
   - Slack receives status messages
   - `http://YOUR_PUBLIC_DOMAIN_OR_IP`
   - `http://YOUR_PUBLIC_DOMAIN_OR_IP/api/health`

For a no-code smoke test, you can use:

```bash
git commit --allow-empty -m "ci: smoke test"
git push origin HEAD
```

## Extending the Pipeline

Safe extension points:

- add end-to-end tests into `ci.yml`
- add staging deployment before production
- replace SSH deployment with GitHub OIDC + AWS services
- add container image publishing to Amazon ECR
- add rollback logic in `scripts/deploy-prod.sh`
