const fs = require('fs');
const path = require('path');

const dir = 'd:/Perkuliahan/Work Order/workorder-portal/docs/test case unit/unit';

function getFunctionName(method, endpoint) {
    let base = endpoint.replace(/^\/|\/$/g, '');
    let parts = base.split('/');
    let name = '';
    
    if (method === 'GET') {
        if (parts[parts.length - 1] === ':id') {
            name = 'get' + capitalize(parts[0]) + 'ById';
        } else if (parts[parts.length - 1] === 'profile') {
            name = 'getProfile';
        } else {
            name = 'getAll' + capitalize(parts[0]);
        }
    } else if (method === 'POST') {
        if (parts[parts.length - 1] === 'login') name = 'login';
        else if (parts[parts.length - 1] === 'logout') name = 'logout';
        else if (parts[parts.length - 1] === 'register') name = 'register';
        else if (parts[parts.length - 1] === 'register-company') name = 'registerCompany';
        else name = 'create' + capitalize(parts[0]);
    } else if (method === 'PUT' || method === 'PATCH') {
        name = 'update' + capitalize(parts[0]);
    } else if (method === 'DELETE') {
        name = 'delete' + capitalize(parts[0]);
    } else {
        name = method.toLowerCase() + capitalize(parts[0]);
    }
    
    // cleanup
    name = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return name + '()';
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace text in the paragraph
    content = content.replace(/Daftar \*endpoint\* pada modul .*? digunakan untuk/g, 'Fungsi-fungsi pada service/controller modul ini digunakan untuk');
    content = content.replace(/Seluruh endpoint memerlukan/g, 'Seluruh fungsi diuji secara terisolasi (isolated) dengan');
    content = content.replace(/penegakan hak akses pada tiap endpoint/g, 'penanganan logika bisnis pada tiap fungsi');
    
    // Find table
    const lines = content.split('\n');
    let inTable = false;
    let newLines = [];
    let idPrefix = 'TC-UNIT';
    
    for (let line of lines) {
        if (line.trim().startsWith('| ID Test |')) {
            inTable = true;
            newLines.push('| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |');
            newLines.push('|---|---|---|---|---|');
            continue;
        }
        if (inTable && line.trim().startsWith('|---')) {
            continue;
        }
        if (inTable && line.trim() === '') {
            inTable = false;
            newLines.push(line);
            continue;
        }
        
        if (inTable && line.trim().startsWith('|')) {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length >= 6) {
                let id = parts[1];
                const routeName = parts[2];
                const method = parts[3];
                const endpoint = parts[4].replace(/`/g, '');
                
                const prefixMatch = id.match(/TC-([A-Z]+)-\d+/);
                if (prefixMatch) {
                    idPrefix = prefixMatch[1];
                }
                
                const funcName = getFunctionName(method, endpoint);
                
                // Row 1: Success
                newLines.push(`| TC-UNIT-${idPrefix}-${parts[1].split('-').pop()}-A | \`${funcName}\` | Berhasil: ${routeName} | Data / ID valid | Mengembalikan hasil yang diharapkan |`);
                // Row 2: Validation / Not Found Error
                if (method === 'GET' && endpoint.includes(':id') || method === 'PUT' || method === 'DELETE') {
                    newLines.push(`| TC-UNIT-${idPrefix}-${parts[1].split('-').pop()}-B | \`${funcName}\` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan \`NotFoundError\` |`);
                } else if (method === 'POST' || method === 'PUT') {
                    newLines.push(`| TC-UNIT-${idPrefix}-${parts[1].split('-').pop()}-B | \`${funcName}\` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan \`ValidationError\` |`);
                }
                // Row 3: Server Error
                newLines.push(`| TC-UNIT-${idPrefix}-${parts[1].split('-').pop()}-C | \`${funcName}\` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan \`InternalServerError\` |`);
            }
        } else {
            newLines.push(line);
        }
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'));
}
console.log('Semua file berhasil diperbarui ke format Unit Test.');
