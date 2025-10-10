// Modelo para representar um Pokémon
export class Pokemon {
    constructor(id, name, image, types) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.types = types; // Array de tipos, ex: ['fire', 'flying']
    }

    // Método para obter o tipo principal (primeiro da lista)
    get primaryType() {
        return this.types[0] || 'unknown';
    }

    // Método para gerar HTML do card (pode ser usado no render)
    getCardHTML() {
        return `
            <li class="pokemon ${this.primaryType}">
                <span class="number">#${this.id.toString().padStart(3, '0')}</span>
                <span class="name">${this.name}</span>
                <div class="detail">
                    <ol class="types">
                        ${this.types.map(type => `<li class="type ${type}">${type}</li>`).join('')}
                    </ol>
                    <img src="${this.image}" alt="${this.name}">
                </div>
            </li>
        `;
    }
}