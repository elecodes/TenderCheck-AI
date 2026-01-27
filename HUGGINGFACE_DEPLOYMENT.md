# Hugging Face Spaces - Deployment Guide

## Step-by-Step Deployment

### 1. Create Hugging Face Account

1. Go to https://huggingface.co
2. Click "Sign Up" (free)
3. Verify your email

### 2. Create a New Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Fill in:
   - **Name:** `tendercheck-ai` (or your preferred name)
   - **License:** Apache 2.0
   - **SDK:** Docker
   - **Hardware:** gpu-t4-small (FREE!)
   - **Visibility:** Public (or Private if you have Pro)

4. Click "Create Space"

### 3. Get Your Space Git URL

After creating, you'll see:
```
https://huggingface.co/spaces/YOUR_USERNAME/tendercheck-ai
```

The Git URL will be:
```
https://huggingface.co/spaces/YOUR_USERNAME/tendercheck-ai
```

### 4. Add Hugging Face as Git Remote

```bash
cd /Users/elena/TenderCheckAI

# Add Hugging Face remote
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/tendercheck-ai

# Verify
git remote -v
```

You should see:
```
hf      https://huggingface.co/spaces/YOUR_USERNAME/tendercheck-ai (fetch)
hf      https://huggingface.co/spaces/YOUR_USERNAME/tendercheck-ai (push)
origin  ... (your GitHub repo)
```

### 5. Commit Hugging Face Files

```bash
# Add new files
git add .huggingface/ Dockerfile

# Commit
git commit -m "Add Hugging Face deployment configuration"
```

### 6. Push to Hugging Face

```bash
# Push to Hugging Face
git push hf main
```

**Note:** You'll be prompted for credentials:
- **Username:** Your Hugging Face username
- **Password:** Your Hugging Face **Access Token** (not your password!)

#### Get Access Token:
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: "TenderCheck Deploy"
4. Role: "Write"
5. Copy the token
6. Use it as password when pushing

### 7. Wait for Build

Hugging Face will:
1. Build Docker image (~5-10 minutes)
2. Pull Mistral + nomic-embed-text models (~5 minutes)
3. Start the app on GPU

**Total build time:** ~10-15 minutes (one-time)

You can watch the build logs in your Space's "Logs" tab.

### 8. Access Your App

Once built, your app will be available at:
```
https://YOUR_USERNAME-tendercheck-ai.hf.space
```

**Performance:** ~30 seconds per validation! 🚀

---

## Troubleshooting

### Build Fails: "Out of Memory"

**Solution:** Reduce model size in Dockerfile:
```dockerfile
# Use quantized Mistral instead
RUN ollama pull mistral:7b-instruct-q4_0
```

### App Doesn't Start

**Check logs:**
1. Go to your Space
2. Click "Logs" tab
3. Look for errors

**Common issues:**
- Port mismatch (should be 3000)
- Ollama not starting (add more sleep time)

### GPU Not Working

**Verify hardware:**
1. Go to your Space settings
2. Check "Hardware" is set to `gpu-t4-small`
3. Restart the Space

---

## Free Tier Limits

### Hugging Face Spaces (Free)

- **GPU hours:** ~50 hours/month
- **Storage:** 50 GB
- **Bandwidth:** Unlimited

**What this means:**
- ~100 validations/month (30 sec each = 50 minutes)
- After GPU hours exhausted, falls back to CPU (~2 min)

### Upgrade Options

If you need more:
- **Pro ($9/month):** 200 GPU hours, private Spaces
- **Enterprise:** Unlimited, dedicated GPUs

---

## Environment Variables

If you need to set environment variables:

1. Go to your Space settings
2. Click "Variables and secrets"
3. Add:
   - `DATABASE_PATH=/app/backend/database.sqlite`
   - `OLLAMA_SERVER_ADDRESS=http://localhost:11434`
   - Any other secrets

---

## Updating Your Deployment

To update your deployed app:

```bash
# Make changes locally
git add .
git commit -m "Update: ..."

# Push to Hugging Face
git push hf main
```

Hugging Face will automatically rebuild and redeploy.

---

## Performance Monitoring

### Check GPU Usage

In your Space logs, you'll see:
```
GPU: NVIDIA Tesla T4
GPU Memory: 15 GB
```

### Benchmark

First validation (cold start):
- Model loading: ~10-20 seconds
- Validation: ~30 seconds
- **Total:** ~50 seconds

Subsequent validations (warm):
- Validation: ~30 seconds
- **Total:** ~30 seconds

---

## Cost Comparison

| Deployment | Time | Cost/Month (100 validations) |
|------------|------|------------------------------|
| Local Mac | 4 min | $0 |
| HF Spaces (GPU) | 30 sec | $0 (free tier) |
| HF Spaces (Pro) | 30 sec | $9 |
| Google Cloud Run | 2 min | ~$5 |
| Replicate | 20 sec | ~$1 |

**Winner:** Hugging Face Spaces (FREE + FAST!)

---

## Next Steps

After deployment:

1. **Test the deployment:**
   - Upload a tender PDF
   - Upload a proposal PDF
   - Verify 30-second validation time

2. **Update frontend (optional):**
   - Point frontend to HF Space URL instead of localhost
   - Deploy frontend separately (Vercel, Netlify, etc.)

3. **Monitor usage:**
   - Check GPU hours in HF dashboard
   - Upgrade to Pro if needed

---

## Questions?

- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
- Hugging Face Discord: https://discord.gg/hugging-face
- This project's issues: [Your GitHub repo]

Happy deploying! 🚀
