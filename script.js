const sessionList = document.getElementById('session-list');
const sessionContent = document.getElementById('session-content');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');
const campaignDetailsBtn = document.getElementById('campaign-details-btn');

let sessions = {};
let currentSessionNumber = null;
let portraitMap = {};

// Initialize emoji parser
const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

// --- HELPER FUNCTIONS ---

function convertEmojis(text) {
    if (!text) return text;
    return emoji.replace_colons(text);
}

function getPortraitUrl(speakerName) {
    if (!speakerName) return 'portraits/defaultportrait.jpg';

    // Check if we have a mapping for this speaker
    const filename = portraitMap[speakerName];
    if (filename) {
        return `portraits/${filename}`;
    }

    // Fallback to default portrait
    return 'portraits/defaultportrait.jpg';
}

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

// --- PARSE POSTS ---

function parseMarkdownFile(mdContent) {
    if (!mdContent || mdContent.trim() === '') {
        return [];
    }

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
            if (!isBody) {
                if (line.trim() === '') {
                    isBody = true;
                    return;
                }

                const match = line.match(/^([a-zA-Z]+):\s*(.*)$/);
                if (match) {
                    post[match[1].toLowerCase()] = match[2].trim();
                } else {
                    // Not a metadata line and not empty, must be the body
                    isBody = true;
                    bodyLines.push(line);
                }
            } else {
                bodyLines.push(line);
            }
        });

        post.bodyRaw = bodyLines.join('\n').trim();
        return post;
    });
}

function organizeSessionPosts(sessionNumber, posts) {
    const recapPost = posts.find(p => p.type === 'recap');
    return {
        number: sessionNumber,
        date: posts.length > 0 ? posts[0].date : formatDate(),
        title: recapPost ? recapPost.title : '',
        posts: posts
    };
}

// --- LOAD PORTRAITS ---

async function loadPortraitConfig() {
    try {
        const response = await fetch('portraits.json');
        if (response.ok) {
            portraitMap = await response.json();
        }
    } catch (error) {
        console.warn('Could not load portrait configuration:', error);
        portraitMap = {};
    }
}

// --- LOAD SESSIONS ---

async function loadAllSessions() {
    sessions = {};

    try {
        // Try to load local session files (session-1.md through session-20.md)
        for (let i = 1; i <= 20; i++) {
            try {
                const response = await fetch(`sessions/session-${i}.md`);
                if (response.ok) {
                    const content = await response.text();
                    const posts = parseMarkdownFile(content);
                    sessions[i] = organizeSessionPosts(i, posts);
                }
            } catch (error) {
                // File doesn't exist, skip
            }
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

// --- RENDER FUNCTIONS ---

function renderSessionList() {
    const sortedSessions = Object.keys(sessions)
        .sort((a, b) => parseInt(b) - parseInt(a));

    if (sortedSessions.length === 0) {
        sessionList.innerHTML = '<div class="loading-sessions">No sessions found.</div>';
        return;
    }

    sessionList.innerHTML = sortedSessions.map(sessionNum => {
        const session = sessions[sessionNum];
        const postCount = session.posts.length;
        const recapCount = session.posts.filter(p => p.type === 'recap').length;

        return `
            <div class="session-item" data-session="${sessionNum}">
                <span class="material-symbols-outlined session-item-icon">history_edu</span>
                <div class="session-item-number">Session ${sessionNum}</div>
                ${session.title ? `<div class="session-item-title">${session.title}</div>` : ''}
                <div class="session-item-date">${session.date}</div>
                <div class="session-item-count">${postCount} ${postCount === 1 ? 'entry' : 'entries'}${recapCount > 0 ? ` • ${recapCount} recap` : ''}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', () => {
            const sessionNum = item.dataset.session;
            displaySession(sessionNum);
        });
    });
}

function displaySession(sessionNum) {
    currentSessionNumber = sessionNum;
    const session = sessions[sessionNum];

    if (!session) return;

    // Update active state
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.toggle('active', item.dataset.session === sessionNum);
    });

    if (campaignDetailsBtn) {
        campaignDetailsBtn.classList.remove('active');
    }

    // Separate recap and other posts
    const recapPosts = session.posts.filter(p => p.type === 'recap');
    const otherPosts = session.posts.filter(p => p.type !== 'recap');

    let html = `
        <div class="session-header">
            <h1 class="session-header-title">Session ${sessionNum}</h1>
            <div class="session-header-date">${session.date}</div>
        </div>
    `;

    // Render recap first
    recapPosts.forEach(post => {
        html += createPostCardHtml(post, true);
    });

    // Render other posts
    otherPosts.forEach(post => {
        html += createPostCardHtml(post, false);
    });

    sessionContent.innerHTML = html;

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }

    // Scroll to top
    document.querySelector('.content-area').scrollTop = 0;

    // Update campaign button active state
    if (campaignDetailsBtn) {
        campaignDetailsBtn.classList.remove('active');
    }
}

async function displayCampaignDetails() {
    currentSessionNumber = null;

    // Update active states
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.remove('active');
    });

    if (campaignDetailsBtn) {
        campaignDetailsBtn.classList.add('active');
    }

    try {
        const response = await fetch('campaign.md');
        if (!response.ok) throw new Error('Could not load campaign details');

        const content = await response.text();
        const posts = parseMarkdownFile(content);

        let html = `
            <div class="session-header">
                <h1 class="session-header-title">Campaign Details</h1>
            </div>
        `;

        posts.forEach(post => {
            html += createPostCardHtml(post, false);
        });

        sessionContent.innerHTML = html;

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }

        // Scroll to top
        document.querySelector('.content-area').scrollTop = 0;
    } catch (error) {
        console.error('Error loading campaign details:', error);
        sessionContent.innerHTML = `
            <div class="welcome-message">
                <h2>Error</h2>
                <p>Could not load Campaign Details. Please ensure <code>campaign.md</code> exists.</p>
            </div>
        `;
    }
}

function createPostCardHtml(post, isRecap) {
    const bodyWithEmojis = convertEmojis(post.bodyRaw || '');
    const bodyHtml = marked.parse(bodyWithEmojis);
    let contentHtml = '';
    let extraClass = isRecap ? 'recap-card' : '';

    switch (post.type.toLowerCase()) {
        case 'recap':
        case 'text':
            extraClass += post.type === 'recap' ? ' recap-card' : '';
            contentHtml = `
                <div class="card-padding">
                    ${post.type === 'recap' ? '<span class="post-type-label">Session Recap</span>' : ''}
                    <h2 class="text-title">${convertEmojis(escapeHtml(post.title || 'Untitled'))}</h2>
                    <div class="text-body">${bodyHtml}</div>
                </div>`;
            break;

        case 'character':
            extraClass += ' character-card';
            const charName = post.name || 'Unknown Character';
            const charPortraitUrl = getPortraitUrl(charName);
            contentHtml = `
                <div class="card-padding">
                    <div class="character-intro-card">
                        <div class="character-portrait-column">
                            <img src="${charPortraitUrl}" alt="${escapeHtml(charName)}" class="character-portrait">
                            <span class="char-intro-name">${convertEmojis(escapeHtml(charName))}</span>
                        </div>
                        <div class="character-description-column">
                            <span class="post-type-label">Character</span>
                            <div class="text-body">${bodyHtml}</div>
                        </div>
                    </div>
                </div>`;
            break;

        case 'location':
            extraClass += ' location-card';
            const locName = post.name || 'Unknown Location';
            contentHtml = `
                <div class="card-padding">
                    <span class="post-type-label">Location</span>
                    <div class="location-intro-card">
                        <div class="location-icon-column">
                            <span class="material-symbols-outlined location-icon">map</span>
                            <span class="location-intro-name">${convertEmojis(escapeHtml(locName))}</span>
                        </div>
                        <div class="location-description-column">
                            <div class="text-body">${bodyHtml}</div>
                            ${post.characters ? `
                                <div class="location-characters">
                                    ${post.characters.split(',').map(name => {
                const cleanName = name.trim();
                return `
                                            <div class="location-character-item" title="${escapeHtml(cleanName)}">
                                                <img src="${getPortraitUrl(cleanName)}" alt="${escapeHtml(cleanName)}" class="location-character-portrait">
                                                <span class="location-character-name">${convertEmojis(escapeHtml(cleanName))}</span>
                                            </div>
                                        `;
            }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            break;

        case 'travel':
            extraClass += ' travel-card';
            contentHtml = `
                <div class="card-padding">
                    <span class="post-type-label">Travel</span>
                    <div class="travel-visualization">
                        <div class="travel-icon-point">
                            <span class="material-symbols-outlined travel-point-icon">moved_location</span>
                            <span class="travel-point-label">${escapeHtml(post.from || 'Origin')}</span>
                        </div>
                        
                        <div class="travel-path-container">
                            <svg class="travel-wave" viewBox="0 0 200 40" preserveAspectRatio="none">
                                <path d="M0,20 Q25,5 50,20 T100,20 T150,20 T200,20" class="travel-wave-path" />
                            </svg>
                            <span class="material-symbols-outlined travel-ship-icon">sailing</span>
                        </div>

                        <div class="travel-icon-point">
                            <span class="material-symbols-outlined travel-point-icon">anchor</span>
                            <span class="travel-point-label">${escapeHtml(post.to || 'Destination')}</span>
                        </div>
                    </div>
                    <div class="text-body">${bodyHtml}</div>
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
                const portraitUrl = getPortraitUrl(speaker);
                return `<div class="chat-bubble-row ${side}">
                            <span class="speaker-name">
                                <img src="${portraitUrl}" alt="${escapeHtml(speaker)}" class="speaker-portrait">
                                ${convertEmojis(escapeHtml(speaker))}
                            </span>
                            <div class="chat-bubble ${side}">${convertEmojis(escapeHtml(text))}</div>
                        </div>`;
            }).filter(html => html).join('');

            contentHtml = `
                <div class="card-padding">
                    <span class="post-type-label">Conversation</span>
                    <div class="chat-container">${messagesHtml}</div>
                </div>`;
            break;

        case 'quote':
            extraClass += ' quote-card';
            const authorName = post.author || 'Unknown';
            const authorPortraitUrl = getPortraitUrl(authorName);
            contentHtml = `
                <div class="card-padding">
                    <span class="post-type-label">Quote</span>
                    <div class="quote-text">"${convertEmojis(escapeHtml(post.bodyRaw))}"</div>
                    <div class="quote-author">
                        <img src="${authorPortraitUrl}" alt="${escapeHtml(authorName)}" class="author-portrait">
                        — ${convertEmojis(escapeHtml(authorName))}
                    </div>
                </div>`;
            break;
    }

    return `<article class="post-card ${extraClass}">${contentHtml}</article>`;
}

// --- INITIALIZATION ---

async function initDiary() {
    sessionList.innerHTML = '<div class="loading-sessions">Loading sessions...</div>';

    // Load portrait configuration first
    await loadPortraitConfig();

    await loadAllSessions();
    renderSessionList();

    // Auto-select first session or show welcome
    const sortedSessions = Object.keys(sessions)
        .sort((a, b) => parseInt(b) - parseInt(a));

    if (sortedSessions.length > 0) {
        displaySession(sortedSessions[0]);
    } else {
        displaySession(null); // Will show welcome message if no sessions
    }

    // Add listener for campaign details
    if (campaignDetailsBtn) {
        campaignDetailsBtn.addEventListener('click', displayCampaignDetails);
    }
}

// --- MOBILE SIDEBAR TOGGLE ---

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// --- KEYBOARD SHORTCUTS ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// --- INITIALIZE ---

document.addEventListener('DOMContentLoaded', initDiary);
