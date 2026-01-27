# Hugging Face Spaces Deployment

This directory contains configuration for deploying TenderCheck AI to Hugging Face Spaces with FREE GPU support.

## What's Included

- `config.yml` - Hugging Face Space configuration
- Hardware: `gpu-t4-small` (FREE tier)
- SDK: Docker

## Performance

- **Local (8GB Mac CPU):** 4 minutes per validation
- **Hugging Face (T4 GPU):** ~30 seconds per validation

**10x faster!** 🚀

## Deployment Instructions

See `/cloud_deployment_guide.md` for full deployment steps.

## Quick Start

1. Create Hugging Face account at https://huggingface.co
2. Create new Space with Docker + GPU
3. Push this repository to the Space
4. Wait for build (~10 minutes)
5. Enjoy 30-second validations!
