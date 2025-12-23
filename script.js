const feedContainer = document.getElementById('blog-feed');
const fabBtn = document.getElementById('fab-add');
const dialog = document.getElementById('post-dialog');
const postForm = document.getElementById('post-form');
const postTypeSelect = document.getElementById('post-type');
const fieldsContainer = document.getElementById('fields-container');
const cancelBtn = document.getElementById('btn-cancel');
const settingsBtn = document.getElementById('settings-btn');
const settingsDialog = document.getElementById('settings-dialog');
const settingsForm = document.getElementById('settings-form');
const cancelSettingsBtn = document.getElementById('btn-cancel-settings');

// We hold the full raw text of the file so we can append to it later
let rawMarkdownData = "";
let currentFileSha = null; // Needed for GitHub API updates

// GitHub Configuration (loaded from localStorage)
let githubConfig = {
    owner: localStorage.getItem('github_owner') || '',
    repo: localStorage.getItem('github_repo') || '',
    token: localStorage.getItem('github_token') || '',
    branch: localStorage.getItem('github_branch') || 'main'
};

// Theme Configuration (loaded from localStorage)
let themeConfig = {
    primary: localStorage.getItem('theme_primary') || '#6750A4',
    secondary: localStorage.getItem('theme_secondary') || '#625B71',
    tertiary: localStorage.getItem('theme_tertiary') || '#7D5260',
    surface: localStorage.getItem('theme_surface') || '#FEF7FF',
    surfaceContainer: localStorage.getItem('theme_surface_container') || '#F3EDF7'
};

// --- HELPER FUNCTIONS ---

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date = new Date()) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function showLoading() {
    feedContainer.innerHTML = `
        <div class="card card-padding" style="text-align: center;">
            <p>Loading posts...</p>
        </div>`;
}

function showEmptyState() {
    feedContainer.innerHTML = `
        <div class="card card-padding" style="text-align: center;">
            <h2 style="margin-top: 0;">Welcome to Your Blog!</h2>
            <p style="color: var(--md-sys-color-on-surface-variant);">
                No posts yet. Click the <strong>+</strong> button to create your first post.
            </p>
            ${!isGitHubConfigured() ? `
            <p style="color: var(--md-sys-color-primary); margin-top: 16px;">
                💡 Click the ⚙️ settings icon to set up automatic GitHub publishing!
            </p>
            ` : ''}
        </div>`;
}

function showSuccess(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-toast';
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

function showError(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-toast';
    errorMsg.textContent = message;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 4000);
}

function isGitHubConfigured() {
    return githubConfig.owner && githubConfig.repo && githubConfig.token;
}

function isValidHexColor(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function applyTheme() {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--md-sys-color-primary', themeConfig.primary);
    
    // Apply secondary color
    root.style.setProperty('--md-sys-color-secondary', themeConfig.secondary);
    
    // Apply tertiary color
    root.style.setProperty('--md-sys-color-tertiary', themeConfig.tertiary);
    
    // Apply surface colors
    root.style.setProperty('--md-sys-color-surface', themeConfig.surface);
    root.style.setProperty('--md-sys-color-surface-container', themeConfig.surfaceContainer);
    
    // Auto-generate container colors (lighter versions)
    root.style.setProperty('--md-sys-color-primary-container', lightenColor(themeConfig.primary, 40));
    root.style.setProperty('--md-sys-color-secondary-container', lightenColor(themeConfig.secondary, 40));
    root.style.setProperty('--md-sys-color-tertiary-container', lightenColor(themeConfig.tertiary, 40));
}

function lightenColor(hex, percent) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Lighten by moving towards white
    const newR = Math.round(r + (255 - r) * (percent / 100));
    const newG = Math.round(g + (255 - g) * (percent / 100));
    const newB = Math.round(b + (255 - b) * (percent / 100));
    
    // Convert back to hex
    return '#' + [newR, newG, newB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function resetTheme() {
    themeConfig = {
        primary: '#6750A4',
        secondary: '#625B71',
        tertiary: '#7D5260',
        surface: '#FEF7FF',
        surfaceContainer: '#F3EDF7'
    };
    
    // Clear from localStorage
    localStorage.removeItem('theme_primary');
    localStorage.removeItem('theme_secondary');
    localStorage.removeItem('theme_tertiary');
    localStorage.removeItem('theme_surface');
    localStorage.removeItem('theme_surface_container');
    
    applyTheme();
    
    // Update form fields
    document.getElementById('theme-primary').value = themeConfig.primary;
    document.getElementById('theme-secondary').value = themeConfig.secondary;
    document.getElementById('theme-tertiary').value = themeConfig.tertiary;
    document.getElementById('theme-surface').value = themeConfig.surface;
    document.getElementById('theme-surface-container').value = themeConfig.surfaceContainer;
    
    showSuccess('Theme reset to default colors!');
}

// --- GITHUB API FUNCTIONS ---

async function fetchFromGitHub() {
    if (!isGitHubConfigured()) {
        throw new Error('GitHub not configured');
    }

    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/posts.md?ref=${githubConfig.branch}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${githubConfig.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            // File doesn't exist yet, that's okay
            return { content: '', sha: null };
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    currentFileSha = data.sha;
    
    // Decode base64 content
    const content = atob(data.content);
    return { content, sha: data.sha };
}

async function commitToGitHub(content, message) {
    if (!isGitHubConfigured()) {
        throw new Error('GitHub not configured. Please configure in settings.');
    }

    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/posts.md`;
    
    // Encode content to base64
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const body = {
        message: message,
        content: encodedContent,
        branch: githubConfig.branch
    };

    // Include SHA if file exists (for updates)
    if (currentFileSha) {
        body.sha = currentFileSha;
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    currentFileSha = data.content.sha;
    return data;
}

// --- 1. Fetch & Parse Logic ---

async function initBlog() {
    showLoading();
    
    // Apply saved theme
    applyTheme();
    
    try {
        let content;
        
        if (isGitHubConfigured()) {
            // Try to load from GitHub
            const result = await fetchFromGitHub();
            content = result.content;
            rawMarkdownData = content;
        } else {
            // Fallback to local posts.md
            const response = await fetch('posts.md');
            if (response.ok) {
                content = await response.text();
                rawMarkdownData = content;
            } else {
                throw new Error('No posts found');
            }
        }
        
        const posts = parseMarkdownFile(content);
        
        if (posts.length === 0) {
            showEmptyState();
        } else {
            renderPosts(posts);
        }
    } catch (error) {
        console.warn("No posts found. Starting with empty blog.", error);
        rawMarkdownData = "";
        showEmptyState();
    }
}

// Parses "---" separated blocks into Objects
function parseMarkdownFile(mdContent) {
    if (!mdContent || mdContent.trim() === '') {
        return [];
    }
    
    // More robust splitting - handles trailing spaces and different line endings
    const chunks = mdContent
        .split(/\r?\n---\r?\n/)
        .map(c => c.trim())
        .filter(c => c.length > 0);
    
    return chunks.map(chunk => {
        const lines = chunk.split(/\r?\n/);
        const post = { type: 'text', content: '' };
        let isBody = false;
        let bodyLines = [];

        lines.forEach(line => {
            // Empty line indicates end of Headers and start of Body
            if (!isBody && line.trim() === '') {
                isBody = true;
                return;
            }

            if (!isBody) {
                // Parse Headers (Type: value)
                const match = line.match(/^([a-zA-Z]+):\s*(.*)$/);
                if (match) {
                    post[match[1].toLowerCase()] = match[2].trim();
                }
            } else {
                bodyLines.push(line);
            }
        });

        post.bodyRaw = bodyLines.join('\n').trim();
        return post;
    });
}

// --- 2. Render Logic ---

function renderPosts(posts) {
    feedContainer.innerHTML = '';
    posts.forEach(post => {
        feedContainer.insertAdjacentHTML('beforeend', createCardHtml(post));
    });
}

function createCardHtml(post) {
    let contentHtml = '';
    const dateStr = post.date || formatDate();

    // Use Marked.js to turn Markdown into HTML
    const bodyHtml = marked.parse(post.bodyRaw || '');

    switch(post.type.toLowerCase()) {
        case 'text':
            contentHtml = `
                <div class="card-padding">
                    <span class="timestamp">${dateStr}</span>
                    <h2 class="text-title">${escapeHtml(post.title || 'Untitled')}</h2>
                    <div class="text-body">${bodyHtml}</div>
                </div>`;
            break;
            
        case 'image':
            // For images, bodyRaw is just the URL
            contentHtml = `
                <div class="card-image">
                    <img src="${escapeHtml(post.bodyRaw)}" alt="Post Image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage not found%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="image-caption">
                    <span class="timestamp">${dateStr}</span>
                    <p>${escapeHtml(post.caption || '')}</p>
                </div>`;
            break;
            
        case 'conversation':
            const lines = post.bodyRaw.split('\n').filter(line => line.trim());
            const messagesHtml = lines.map((line, index) => {
                const sep = line.indexOf(':');
                if (sep === -1) return '';
                
                const speaker = line.substring(0, sep).trim();
                const text = line.substring(sep + 1).trim();
                
                if (!speaker || !text) return '';
                
                const side = (index % 2 === 0) ? 'left' : 'right';
                return `<div class="chat-bubble-row ${side}">
                            <span class="speaker-name">${escapeHtml(speaker)}</span>
                            <div class="chat-bubble ${side}">${escapeHtml(text)}</div>
                        </div>`;
            }).filter(html => html).join('');
            
            contentHtml = `
                <div class="card-padding">
                    <span class="timestamp">${dateStr}</span>
                    <div class="chat-container">${messagesHtml}</div>
                </div>`;
            break;
            
        case 'quote':
            contentHtml = `
                <div class="card-padding">
                    <span class="timestamp">${dateStr}</span>
                    <div class="quote-text">"${escapeHtml(post.bodyRaw)}"</div>
                    <div class="quote-author">— ${escapeHtml(post.author || 'Unknown')}</div>
                </div>`;
            break;
            
        default:
            contentHtml = `
                <div class="card-padding">
                    <span class="timestamp">${dateStr}</span>
                    <p>Unknown post type: ${escapeHtml(post.type)}</p>
                </div>`;
    }
    
    const extraClass = post.type === 'quote' ? 'quote-container' : '';
    return `<article class="card ${extraClass}">${contentHtml}</article>`;
}

// --- 3. Settings Dialog Logic ---

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked');
        
        // Pre-fill GitHub form with current values
        document.getElementById('github-owner').value = githubConfig.owner;
        document.getElementById('github-repo').value = githubConfig.repo;
        document.getElementById('github-token').value = githubConfig.token;
        document.getElementById('github-branch').value = githubConfig.branch;
        
        // Pre-fill theme form with current values
        document.getElementById('theme-primary').value = themeConfig.primary;
        document.getElementById('theme-secondary').value = themeConfig.secondary;
        document.getElementById('theme-tertiary').value = themeConfig.tertiary;
        document.getElementById('theme-surface').value = themeConfig.surface;
        document.getElementById('theme-surface-container').value = themeConfig.surfaceContainer;
        
        settingsDialog.showModal();
    });
} else {
    console.error('Settings button not found!');
}

if (cancelSettingsBtn) {
    cancelSettingsBtn.addEventListener('click', () => {
        settingsDialog.close();
    });
}

// Reset theme button
const resetThemeBtn = document.getElementById('btn-reset-theme');
if (resetThemeBtn) {
    resetThemeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetTheme();
    });
}

if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Save GitHub config to localStorage
        githubConfig.owner = document.getElementById('github-owner').value.trim();
        githubConfig.repo = document.getElementById('github-repo').value.trim();
        githubConfig.token = document.getElementById('github-token').value.trim();
        githubConfig.branch = document.getElementById('github-branch').value.trim() || 'main';
        
        localStorage.setItem('github_owner', githubConfig.owner);
        localStorage.setItem('github_repo', githubConfig.repo);
        localStorage.setItem('github_token', githubConfig.token);
        localStorage.setItem('github_branch', githubConfig.branch);
        
        // Save theme config to localStorage
        const primaryInput = document.getElementById('theme-primary').value.trim();
        const secondaryInput = document.getElementById('theme-secondary').value.trim();
        const tertiaryInput = document.getElementById('theme-tertiary').value.trim();
        const surfaceInput = document.getElementById('theme-surface').value.trim();
        const surfaceContainerInput = document.getElementById('theme-surface-container').value.trim();
        
        // Validate hex colors
        const colors = [
            { name: 'Primary', value: primaryInput },
            { name: 'Secondary', value: secondaryInput },
            { name: 'Tertiary', value: tertiaryInput },
            { name: 'Surface', value: surfaceInput },
            { name: 'Surface Container', value: surfaceContainerInput }
        ];
        
        let allValid = true;
        for (const color of colors) {
            if (color.value && !isValidHexColor(color.value)) {
                showError(`${color.name} color must be a valid hex code (e.g., #6750A4)`);
                allValid = false;
                break;
            }
        }
        
        if (!allValid) return;
        
        // Apply theme colors
        if (primaryInput) {
            themeConfig.primary = primaryInput;
            localStorage.setItem('theme_primary', primaryInput);
        }
        if (secondaryInput) {
            themeConfig.secondary = secondaryInput;
            localStorage.setItem('theme_secondary', secondaryInput);
        }
        if (tertiaryInput) {
            themeConfig.tertiary = tertiaryInput;
            localStorage.setItem('theme_tertiary', tertiaryInput);
        }
        if (surfaceInput) {
            themeConfig.surface = surfaceInput;
            localStorage.setItem('theme_surface', surfaceInput);
        }
        if (surfaceContainerInput) {
            themeConfig.surfaceContainer = surfaceContainerInput;
            localStorage.setItem('theme_surface_container', surfaceContainerInput);
        }
        
        applyTheme();
        
        settingsDialog.close();
        showSuccess('Settings saved successfully!');
        
        // Reload posts from GitHub if configured
        if (isGitHubConfigured()) {
            initBlog();
        }
    });
}

// --- 4. Form & Submission Logic ---

fabBtn.addEventListener('click', () => { 
    updateFormFields('text'); 
    dialog.showModal(); 
});

cancelBtn.addEventListener('click', () => {
    dialog.close();
    postForm.reset();
});

postTypeSelect.addEventListener('change', (e) => updateFormFields(e.target.value));

function updateFormFields(type) {
    let html = '';
    if (type === 'text') {
        html = `<div class="input-group">
                    <label>Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="input-group">
                    <label>Content (Markdown supported)</label>
                    <textarea name="content" rows="6" required></textarea>
                </div>`;
    } else if (type === 'image') {
        html = `<div class="input-group">
                    <label>Image URL</label>
                    <input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" required>
                </div>
                <div class="input-group">
                    <label>Caption</label>
                    <input type="text" name="caption" required>
                </div>`;
    } else if (type === 'quote') {
        html = `<div class="input-group">
                    <label>Quote Text</label>
                    <textarea name="text" rows="4" required></textarea>
                </div>
                <div class="input-group">
                    <label>Author</label>
                    <input type="text" name="author" required>
                </div>`;
    } else if (type === 'conversation') {
        html = `<div class="input-group">
                    <label>Conversation Script</label>
                    <textarea name="rawConversation" rows="8" placeholder="Alice: Hello!
Bob: Hi there!
Alice: How are you?" required></textarea>
                    <small style="color: var(--md-sys-color-on-surface-variant); font-size: 11px; margin-top: 4px;">
                        Format: Name: Message (one per line)
                    </small>
                </div>`;
    }
    fieldsContainer.innerHTML = html;
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(postForm);
    const type = formData.get('type');
    
    // --- Validation ---
    if (type === 'text') {
        const title = formData.get('title')?.trim();
        const content = formData.get('content')?.trim();
        if (!title || !content) {
            showError('Please fill in all fields');
            return;
        }
    } else if (type === 'conversation') {
        const rawConvo = formData.get('rawConversation')?.trim();
        if (!rawConvo) {
            showError('Please enter a conversation');
            return;
        }
        const lines = rawConvo.split('\n').filter(l => l.trim());
        const allValid = lines.every(line => line.includes(':'));
        if (!allValid) {
            showError('Each line must be in format: "Name: Message"');
            return;
        }
    } else if (type === 'image') {
        const imageUrl = formData.get('imageUrl')?.trim();
        if (!imageUrl || !imageUrl.startsWith('http')) {
            showError('Please enter a valid image URL');
            return;
        }
    }
    
    const date = formatDate();
    
    // Create the New Block in Markdown format
    let newBlock = `Type: ${type}\nDate: ${date}\n`;

    if (type === 'text') {
        newBlock += `Title: ${formData.get('title')}\n\n${formData.get('content')}`;
    } else if (type === 'image') {
        newBlock += `Caption: ${formData.get('caption')}\n\n${formData.get('imageUrl')}`;
    } else if (type === 'quote') {
        newBlock += `Author: ${formData.get('author')}\n\n${formData.get('text')}`;
    } else if (type === 'conversation') {
        newBlock += `\n${formData.get('rawConversation')}`;
    }

    // Combine New Block + Existing Data (Newest on Top)
    const updatedFileContent = rawMarkdownData.trim() 
        ? newBlock + "\n---\n" + rawMarkdownData 
        : newBlock;

    dialog.close();
    postForm.reset();
    
    // Show uploading state
    showLoading();

    try {
        if (isGitHubConfigured()) {
            // Commit to GitHub
            await commitToGitHub(
                updatedFileContent, 
                `Add new ${type} post: ${date}`
            );
            
            showSuccess('Post published to GitHub! 🎉');
        } else {
            // Fallback to download
            const blob = new Blob([updatedFileContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'posts.md';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showSuccess('Post created! Upload posts.md to publish.');
        }
        
        // Refresh view
        rawMarkdownData = updatedFileContent;
        const posts = parseMarkdownFile(updatedFileContent);
        renderPosts(posts);
        
    } catch (error) {
        console.error('Error publishing post:', error);
        showError(`Failed to publish: ${error.message}`);
        
        // Show the form again so user can retry
        dialog.showModal();
    }
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // Escape key closes dialogs
    if (e.key === 'Escape') {
        if (dialog.open) {
            dialog.close();
            postForm.reset();
        }
        if (settingsDialog && settingsDialog.open) {
            settingsDialog.close();
        }
    }
    
    // Cmd/Ctrl + K opens new post dialog
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        updateFormFields('text');
        dialog.showModal();
    }
    
    // Cmd/Ctrl + , opens settings
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        if (settingsBtn) {
            settingsBtn.click();
        }
    }
});

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing blog...');
    console.log('Settings button exists:', !!settingsBtn);
    console.log('Settings dialog exists:', !!settingsDialog);
    initBlog();
});
