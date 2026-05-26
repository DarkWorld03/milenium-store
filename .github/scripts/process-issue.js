const fs = require('fs');

const issueBody = process.env.ISSUE_BODY || '';
const issueNumber = process.env.ISSUE_NUMBER || '0';

// Parsear el cuerpo del issue
function parseIssue(body) {
    const lines = body.split('\n');
    const data = {};

    lines.forEach(line => {
        if (line.includes(':')) {
            const [key, value] = line.split(':').map(s => s.trim());
            data[key] = value;
        }
    });

    return data;
}

function main() {
    try {
        const data = parseIssue(issueBody);

        // Leer productos.json actual
        let products = [];
        if (fs.existsSync('productos.json')) {
            products = JSON.parse(fs.readFileSync('productos.json', 'utf8'));
        }

        // Crear nuevo producto
        const newProduct = {
            id: data.tipo + '_' + Date.now(),
            tipo: data.tipo || 'otro',
            nombre: data.nombre || 'Sin nombre',
            precio: data.precio || '0.00',
            imagen_url: data.imagen_url || '',
            descripcion: data.descripcion || '',
            fecha: new Date().toISOString().split('T')[0]
        };

        // Agregar campos específicos según tipo
        if (data.tipo === 'heroe') {
            newProduct.heroe = data.heroe || '';
            newProduct.rareza = data.rareza || 'Comun';
        } else if (data.tipo === 'cuenta') {
            newProduct.mmr = parseInt(data.mmr) || 0;
            newProduct.rango = data.rango || '';
            newProduct.comportamiento = parseInt(data.comportamiento) || 10000;
            newProduct.steam_level = parseInt(data.steam_level) || 0;
            newProduct.correo_original = data.correo_original === 'true';
        } else if (data.tipo === 'mensajero') {
            newProduct.calidad = data.calidad || 'Comun';
        } else if (data.tipo === 'otro') {
            newProduct.categoria = data.categoria || 'Otros';
        }

        products.push(newProduct);

        // Guardar
        fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));

        console.log('Producto agregado:', newProduct.nombre);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
