exports.handler = async function(event, context) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = "DarkWorld03";
    const REPO_NAME = "milenium-store";
    const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/productos.json`;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    
    try {
        const body = JSON.parse(event.body);
        const { action, data, sha } = body;
        
        if (action === 'get') {
            const response = await fetch(GITHUB_API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                return { statusCode: 200, headers, body: JSON.stringify({ content: [], sha: null }) };
            }
            
            const githubData = await response.json();
            const content = JSON.parse(Buffer.from(githubData.content, 'base64').toString('utf8'));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ content, sha: githubData.sha })
            };
            
        } else if (action === 'save') {
            const contentStr = JSON.stringify(data, null, 2);
            const contentBase64 = Buffer.from(contentStr).toString('base64');
            
            const requestBody = {
                message: 'Update from Milenium Store admin',
                content: contentBase64,
                branch: 'main'
            };
            
            if (sha) requestBody.sha = sha;
            
            const response = await fetch(GITHUB_API_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'GitHub API error');
            }
            
            const result = await response.json();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, sha: result.content.sha })
            };
        }
        
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};