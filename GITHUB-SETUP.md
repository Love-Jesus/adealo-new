# GitHub Setup Guide

This guide will help you set up GitHub authentication and push your repository to GitHub.

## Creating a Personal Access Token (PAT)

GitHub no longer supports password authentication for Git operations. Instead, you need to use a Personal Access Token (PAT). Here's how to create one:

1. **Go to GitHub Settings**:
   - Log in to GitHub
   - Click on your profile picture in the top-right corner
   - Select "Settings"

2. **Access Developer Settings**:
   - Scroll down to the bottom of the sidebar
   - Click on "Developer settings"

3. **Generate a Personal Access Token**:
   - Click on "Personal access tokens"
   - Click on "Tokens (classic)"
   - Click "Generate new token" and select "Generate new token (classic)"
   - Give your token a descriptive name (e.g., "Adealo Development")
   - Set an expiration date (e.g., 90 days)
   - Select the following scopes:
     - `repo` (all)
     - `workflow` (if you plan to use GitHub Actions)
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately! You won't be able to see it again.

## Using Your Personal Access Token

### Method 1: Store the Token in the Git Credential Manager

This method allows you to enter your token once, and Git will remember it:

```bash
# On macOS
git credential-osxkeychain store
# Enter your credentials when prompted:
# URL: https://github.com
# Username: your-github-username
# Password: your-personal-access-token

# On Windows
git credential-manager store
# Enter your credentials when prompted
```

### Method 2: Include the Token in the Remote URL

You can include your token directly in the remote URL:

```bash
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/Love-Jesus/adealo-new.git
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_TOKEN` with your personal access token

### Method 3: Configure Git to Use the GitHub CLI

If you have the GitHub CLI installed:

```bash
# Install GitHub CLI
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Authenticate
gh auth login

# Push using GitHub CLI
gh repo sync
```

## Pushing Your Repository to GitHub

After setting up authentication, you can push your repository:

```bash
# Push your main branch
git push -u origin main
```

## Cloning the Repository on Your PC

Once your repository is on GitHub, you can clone it on your PC:

```bash
# Clone the repository
git clone https://github.com/Love-Jesus/adealo-new.git

# Or if you're using SSH
git clone git@github.com:Love-Jesus/adealo-new.git
```

## Setting Up SSH Authentication (Alternative Method)

If you prefer using SSH instead of HTTPS:

1. **Generate an SSH key** (if you don't already have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add the SSH key to your GitHub account**:
   - Copy your public key:
     ```bash
     # macOS
     pbcopy < ~/.ssh/id_ed25519.pub
     
     # Windows
     clip < ~/.ssh/id_ed25519.pub
     ```
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

3. **Change your remote URL to use SSH**:
```bash
git remote set-url origin git@github.com:Love-Jesus/adealo-new.git
```

4. **Push your repository**:
   ```bash
   git push -u origin main
   ```

## Troubleshooting

If you encounter issues:

- **Authentication failures**: Double-check your username and token
- **Permission denied**: Ensure your token has the correct scopes
- **Repository not found**: Verify the repository exists and you have access to it
