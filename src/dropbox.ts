declare var Headers: any;
declare var fetch: any;

const client_id = '393p1h15ezdeptp';

export function loggedIn(): boolean {
    return !!access_token();
}

export function logOut() {
    localStorage.setItem('dbx_access_token', '');
    document.location.hash = '';
}

export function access_token(): string | null {
    let hash_data = document
        .location.hash.slice(1).split('&')
        .reduce((x,y) => {
            var [k,v] = y.split('=',2); 
            return Object.assign(x, {[k]:decodeURIComponent(v)})}, {}
        ) as {access_token: string};
    if (hash_data['access_token']) {
        localStorage.setItem('dbx_access_token', hash_data['access_token']);
        document.location.hash = '';
    }
    return localStorage.getItem('dbx_access_token');
}

export function auth_url(): string {
    let href = document.location.href;
    href = href.split('#')[0];    
    return 'https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=' + client_id
        + '&redirect_uri=' + encodeURIComponent(href);
}

export async function upload_json(path: string, data: any) {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + access_token());
    headers.append('Content-Type', 'application/octet-stream');
    headers.append('Dropbox-API-Arg', JSON.stringify({
        "path": path,
        "mode": {".tag": "overwrite"},
        "autorename": true,
        "mute": true
    }))

    let res = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: headers,
        body: new Blob([JSON.stringify(data)]),
        mode: 'cors'                    
    })    
}

export async function download_json(path: string): Promise<any> {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + access_token());    
    headers.append('Dropbox-API-Arg', JSON.stringify({
        "path": path
    }))
    let res = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: headers,        
        mode: 'cors'                    
    });
    return await res.json()    
}