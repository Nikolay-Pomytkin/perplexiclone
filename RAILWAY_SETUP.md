# Railway Deployment Setup - Persistent Volumes

## Problem: Chat History Not Persisting

Railway has **ephemeral filesystems** by default, meaning any data stored locally is lost on:
- Service restarts
- New deployments
- Container recreation

## Solution: Use Railway Volumes

Railway provides persistent volumes that survive deployments and restarts.

### Steps to Set Up Railway Volume:

#### Option 1: Using Railway CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   # or
   brew install railway
   ```

2. **Login and link to your project:**
   ```bash
   railway login
   railway link
   ```

3. **Create a volume:**
   ```bash
   railway volume add --mount-path /app/data
   ```
   
   This will create a volume and mount it at `/app/data`

4. **Redeploy:**
   ```bash
   railway up
   # or push to trigger deployment
   git push origin main
   ```

#### Option 2: Using Railway Dashboard

1. **Go to your Railway project** in the dashboard
2. **Navigate to your service**
3. **Go to Settings → Volumes**
4. **Click "Create Volume"**
   - Name: `perplexity-data`
   - Mount Path: `/app/data`
5. **Click "Create"**
6. **Redeploy your service**

### Verify It's Working:

Check your Railway logs for:
```
Database directory: /app/data
Database path: /app/data/perplexity.db
Directory exists: true
Initializing SQLite database at: /app/data/perplexity.db
```

### How It Works:

- The `railway.json` file specifies a volume mount at `/app/data`
- The database code checks for `DATABASE_PATH` environment variable (not needed with railway.json)
- Since the app runs in `/app`, the volume is accessible at `/app/data`
- SQLite file at `/app/data/perplexity.db` persists across deployments

### Volume Backup:

To backup your database:
```bash
# Using Railway CLI
railway run cat /app/data/perplexity.db > backup.db

# Or SSH into the service
railway run bash
cp /app/data/perplexity.db /tmp/backup.db
```

## Benefits:

- ✅ Persistent storage across deployments
- ✅ Native Railway solution
- ✅ No external dependencies
- ✅ Simple SQLite file storage
- ✅ Easy to backup and restore

## Local Development:

Your local development will continue to use SQLite files in `./data/perplexity.db` (no changes needed).

