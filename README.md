# College Comparison Tool — Netlify Deployment

## Folder structure

```
college-compare/
├── index.html
├── netlify.toml
├── README.md
└── netlify/
    └── functions/
        └── compare.js
```

## Deploy steps

### 1. Get an Anthropic API key
- Go to console.anthropic.com and sign up
- Navigate to "API Keys" and create a new key
- Copy the key (starts with sk-ant-...)

### 2. Deploy to Netlify
- Go to netlify.com and log in (free account)
- Click "Add new site" → "Deploy manually"
- Drag and drop the entire `college-compare` folder onto the upload area
- Wait ~30 seconds for the deploy to complete

### 3. Add your API key as an environment variable
- In your Netlify site dashboard, go to Site configuration → Environment variables
- Click "Add a variable"
- Key: ANTHROPIC_API_KEY
- Value: your key from step 1
- Click Save, then go to Deploys → "Trigger deploy" → "Deploy site"

### 4. Share the URL
Your site will be live at a URL like https://your-site-name.netlify.app
Share this link with students — no login or download required.

## Notes
- The pre-built Caltech/UCLA/Pomona comparison works with no API key
- The "Build Your Own" tab requires the ANTHROPIC_API_KEY environment variable
- The free Netlify plan includes 125,000 function invocations/month — more than enough for a classroom
- To update the site, just drag a new version of the folder onto the Netlify dashboard
