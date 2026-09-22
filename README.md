# PassiveOS — Passive Income Autopilot

Full app: streams, AI ideas/content, DCA simulator, coach, goals.

**Default storage:** file-backed (`backend/data/`) — no MongoDB required.

## Automated deploy (phone-ready HTTPS)

| File | Purpose |
|------|---------|
| `Dockerfile` | One image = UI + API + storage |
| `render.yaml` | One-click Render deploy |
| `railway.toml` | Railway auto-detect |
| `automate.sh` | Local start (no Docker) |

### Render
1. This repo on GitHub
2. https://dashboard.render.com → New → Blueprint → select repo
3. Open the `.onrender.com` URL on your phone

### Local
```bash
bash automate.sh
```
