// Clase que representa una canción con características como tempo, pitch y duración.
class Song {
    constructor(id, tempo, pitch, duration, title) {
        this.id = id;
        this.tempo = tempo;
        this.pitch = pitch;
        this.duration = duration;
        this.title = title;
    }

    // Calcula la distancia Euclidiana a otra canción basada en las características.
    distanceTo(otherSong) {
        return Math.sqrt(
            Math.pow(this.tempo - otherSong.tempo, 2) +
            Math.pow(this.pitch - otherSong.pitch, 2) +
            Math.pow(this.duration - otherSong.duration, 2)
        );
    }
}

// Nodo del Árbol VP que contiene una canción, un radio de distancia y referencias a nodos hijo.
class VPTreeNode {
    constructor(song, radius, left, right) {
        this.song = song;
        this.radius = radius;
        this.left = left;
        this.right = right;
    }
}

// Árbol VP para realizar búsquedas eficientes de canciones similares.
class VPTree {
    constructor(songs) {
        this.root = this.buildVPTree(songs);
    }

    // Construye el Árbol VP recursivamente a partir de una lista de canciones.
    buildVPTree(songs) {
        if (songs.length === 0) return null;

        const vantagePoint = songs[Math.floor(Math.random() * songs.length)];
        const distances = songs.map(song => ({ song, distance: vantagePoint.distanceTo(song) }));
        distances.sort((a, b) => a.distance - b.distance);

        const medianIndex = Math.floor(distances.length / 2);
        const medianDistance = distances[medianIndex].distance;

        const leftSongs = distances.slice(0, medianIndex).map(d => d.song);
        const rightSongs = distances.slice(medianIndex + 1).map(d => d.song);

        return new VPTreeNode(
            vantagePoint,
            medianDistance,
            this.buildVPTree(leftSongs),
            this.buildVPTree(rightSongs)
        );
    }

    // Busca las k canciones más cercanas a una canción de consulta.
    search(querySong, k) {
        const nearestNeighbors = [];

        const searchTree = (node) => {
            if (node === null) return;

            const distance = querySong.distanceTo(node.song);

            if (nearestNeighbors.length < k) {
                nearestNeighbors.push({ song: node.song, distance });
                nearestNeighbors.sort((a, b) => a.distance - b.distance);
            } else if (distance < nearestNeighbors[nearestNeighbors.length - 1].distance) {
                nearestNeighbors.pop();
                nearestNeighbors.push({ song: node.song, distance });
                nearestNeighbors.sort((a, b) => a.distance - b.distance);
            }

            if (distance < node.radius) {
                searchTree(node.left);
                if (distance + nearestNeighbors[nearestNeighbors.length - 1].distance >= node.radius) {
                    searchTree(node.right);
                }
            } else {
                searchTree(node.right);
                if (distance - nearestNeighbors[nearestNeighbors.length - 1].distance <= node.radius) {
                    searchTree(node.left);
                }
            }
        };

        searchTree(this.root);
        return nearestNeighbors;
    }
}

// Datos de ejemplo de canciones
const songs = [
    new Song(1, 120, 55, 215, 'Song A - Artist 1'),
    new Song(2, 128, 60, 180, 'Song B - Artist 2'),
    new Song(3, 115, 50, 200, 'Song C - Artist 3'),
    new Song(4, 130, 65, 220, 'Song D - Artist 4'),
    new Song(5, 110, 45, 240, 'Song E - Artist 5'),
    new Song(6, 140, 70, 190, 'Song F - Artist 6'),
    new Song(7, 118, 52, 195, 'Song G - Artist 7'),
    new Song(8, 125, 58, 175, 'Song H - Artist 8'),
    new Song(9, 122, 57, 205, 'Song I - Artist 9'),
    new Song(10, 132, 63, 210, 'Song J - Artist 10')
];

// Crear instancia del Árbol VP con las canciones
const vpTree = new VPTree(songs);

// Evento que se dispara al enviar el formulario
document.getElementById('song-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Obtener valores del formulario
    const tempo = parseFloat(document.getElementById('tempo').value);
    const pitch = parseFloat(document.getElementById('pitch').value);
    const duration = parseFloat(document.getElementById('duration').value);

    // Validar entrada del usuario
    if (isNaN(tempo) || isNaN(pitch) || isNaN(duration)) {
        alert('Por favor, ingresa valores válidos para todas las características.');
        return;
    }

    // Crear instancia de Song con los valores del formulario para la consulta
    const querySong = new Song(0, tempo, pitch, duration, 'Query Song');
    // Buscar las 3 canciones más similares
    const similarSongs = vpTree.search(querySong, 3);

    // Limpiar resultados anteriores
    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '';

    // Mostrar resultados en la lista
    similarSongs.forEach(({ song, distance }) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${song.title} (ID: ${song.id}, Tempo: ${song.tempo}, Pitch: ${song.pitch}, Duración: ${song.duration}s, Distancia: ${distance.toFixed(2)})`;
        resultsList.appendChild(listItem); // Agregar ítem a la lista
    });
});
