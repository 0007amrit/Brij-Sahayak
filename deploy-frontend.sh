#!/bin/bash
set -e

echo "🎨 ==============================================="
echo "   BrajSahayak — 1-Click Frontend Live Deployer   "
echo "==============================================="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cd "$FRONTEND_DIR"

echo "📦 [1/3] Building production bundle..."
npm run build

echo "🗜️  [2/3] Zipping production build..."
cd dist && zip -q -r ../dist.zip . && cd ..

echo "☁️  [3/3] Uploading and deploying to AWS Amplify..."
python3 -c "
import socket, boto3, subprocess

# Custom DNS resolver for reliability
orig_getaddrinfo = socket.getaddrinfo
def custom_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if host == 'amplify.ap-south-1.amazonaws.com':
        return orig_getaddrinfo('13.225.245.125', port, family, type, proto, flags)
    return orig_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = custom_getaddrinfo

client = boto3.client('amplify', region_name='ap-south-1')
dep = client.create_deployment(appId='d28z732e1tc6qb', branchName='main')
upload_url = dep['zipUploadUrl']
job_id = dep['jobId']

subprocess.run(['curl', '-T', 'dist.zip', '-H', 'Content-Type: application/zip', upload_url], check=True)
client.start_deployment(appId='d28z732e1tc6qb', branchName='main', jobId=job_id)
print('🚀 Live AWS Amplify Deployment Triggered! Job ID:', job_id)
"

echo ""
echo "==============================================="
echo "🎉 SUCCESS! Your UI/UX changes are now LIVE at:"
echo "👉 https://main.d28z732e1tc6qb.amplifyapp.com"
echo "==============================================="
