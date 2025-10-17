# Node.js CI/CD Demo with AWS CodePipeline + CodeBuild + ECR

This repository is a minimal, production‑minded demo for building and pushing a Dockerized Node.js app to **Amazon ECR** with **CodeBuild**, to be consumed by **CodePipeline**. It includes tests (Jest), a multi‑stage `Dockerfile`, and a `buildspec.yml` that logs into ECR, builds, tags, and pushes an image.

> Works great for ECS/EKS demos (attach the pushed image to your deploy stage).

---

## Repo structure

```
.
├─ src/
│  ├─ app.js
│  └─ routes.js
├─ test/
│  └─ app.test.js
├─ Dockerfile
├─ .dockerignore
├─ package.json
├─ package-lock.json
├─ jest.config.js
├─ buildspec.yml
└─ README.md
```

## App overview

- Express server exposing:
  - `GET /` hello route
  - `GET /health` healthcheck
  - `GET /version` returns app version
- `Jest` unit tests
- Multi‑stage Docker build (node:20‑alpine), small runtime image
- `buildspec.yml` to build & push to ECR with tags:
  - commit SHA (from CodeBuild env var `CODEBUILD_RESOLVED_SOURCE_VERSION`)
  - `latest` (optional toggle)

---

## Prerequisites

- An **ECR** repository (e.g., `node-cicd-demo`).
- A **CodeBuild** project with:
  - **Privileged** mode enabled (for Docker).
  - Environment variables (example):
    - `AWS_DEFAULT_REGION` = `us-east-1` (or your region)
    - `ECR_REPOSITORY` = `node-cicd-demo`
    - Optionally `PUSH_LATEST` = `true`
- A **CodePipeline** that uses this repo as Source → CodeBuild as Build.
- A service that will deploy the pushed image (e.g., ECS).

> TIP: You can also run locally with Docker: `docker build -t demo . && docker run -p 3000:3000 demo`

---

## Local development

```bash
# Install deps
npm ci

# Run tests
npm test

# Start locally
npm start
```

## Docker build (local)

```bash
docker build -t node-cicd-demo:local .
docker run --rm -p 3000:3000 node-cicd-demo:local
```

---

## What the buildspec does

- Installs Node.js deps and runs tests
- Authenticates to ECR
- Builds Docker image and tags it with:
  - `IMAGE_TAG` = short commit SHA
  - Optionally `latest` if `PUSH_LATEST=true`
- Pushes to ECR
- Emits `imageDetail.json` for downstream deploy stages (ECS CodeDeploy / CDK / Terraform)

### Required IAM for CodeBuild

Grant the CodeBuild role permissions for:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:CompleteLayerUpload`
- `ecr:InitiateLayerUpload`
- `ecr:PutImage`
- `ecr:UploadLayerPart`
- `ecr:BatchGetImage`
- `ecr:DescribeRepositories`

---

## Sample Outputs

- `imageDetail.json` artifact with fields:
  ```json
  {
    "name": "123456789012.dkr.ecr.us-east-1.amazonaws.com/node-cicd-demo",
    "imageUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/node-cicd-demo:abcd123"
  }
  ```

Use this file in your deploy stage to reference the exact image produced by the build.

---

## Notes

- The app binds to port **3000** (see `EXPOSE` in Dockerfile).
- The runtime image is a slim Alpine build with only production deps.
- For ECS demo, wire `imageDetail.json` into your task definition action (or parse it in a CDK/Terraform step).
