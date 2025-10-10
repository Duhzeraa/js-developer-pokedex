// Classe Pokemon (mantida, com suporte completo)
class Pokemon {
    constructor(id, name, image, types, stats = [], height = 0, weight = 0) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.types = types;
        this.stats = stats;
        this.height = height; // Em decímetros (ex: 7 = 0.7m)
        this.weight = weight; // Em hectogramas (ex: 100 = 10.0kg)
    }

    get primaryType() {
        return this.types[0] || 'normal';
    }

    // HTML para card na lista (simples, agora com suporte a clique)
    getCardHTML(name) { // Passa o name para o clique
        return `
            <li class="pokemon ${this.primaryType}" data-pokemon-name="${name}">
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

    // HTML para tela detalhada (mantida, com botão voltar)
    getSearchCardHTML() {
        // Stats com barras (6 principais)
        const mainStats = this.stats.slice(0, 6);
        const statBars = mainStats.map(stat => {
            const maxStat = 255;
            const percent = (stat.value / maxStat) * 100;
            const statName = stat.name.replace('-', ' ').toUpperCase();
            return `
                <div class="stat-item">
                    <span>${statName}: ${stat.value}</span>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Detalhes básicos
        const heightM = (this.height / 10).toFixed(1);
        const weightKg = (this.weight / 10).toFixed(1);

        return `
            <!-- Botão Voltar -->
            <button class="back-button" onclick="window.backToList()">
                <i class="fas fa-arrow-left"></i> Voltar
            </button>
            
            <img src="${this.image}" alt="${this.name}">
            <h2>#${this.id.toString().padStart(3, '0')} ${this.name.toUpperCase()}</h2>
            
            <ol class="types">
                ${this.types.map(type => `<li class="type ${type}">${type}</li>`).join('')}
            </ol>
            
            <!-- Detalhes Básicos -->
            <div class="details">
                <div><strong>Altura:</strong> ${heightM} m</div>
                <div><strong>Peso:</strong> ${weightKg} kg</div>
            </div>
            
            <!-- Stats com Barras -->
            <div class="stats">
                ${statBars}
            </div>
        `;
    }
}

// Funções da API (mantidas)
const API_BASE_URL = 'https://pokeapi.co/api/v2';

async function getPokemonList(limit = 10, offset = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Erro ao buscar lista de Pokémon');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erro na API (lista):', error);
        throw error;
    }
}

async function getPokemonDetails(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${query.toLowerCase()}`);
        if (!response.ok) throw new Error(`Pokémon "${query}" não encontrado. Verifique o nome ou ID.`);
        const data = await response.json();
        
        const id = data.id;
        const name = data.name;
        const image = data.sprites.front_default || 'https://via.placeholder.com/200?text=No+Image';
        const types = data.types.map(typeInfo => typeInfo.type.name);
        const stats = data.stats.map(statInfo => ({
            name: statInfo.stat.name,
            value: statInfo.base_stat
        }));
        const height = data.height;
        const weight = data.weight;
        
        return { id, name, image, types, stats, height, weight };
    } catch (error) {
        console.error(`Erro ao buscar detalhes de "${query}":`, error);
        throw error;
    }
}

async function getMultiplePokemonDetails(pokemonNames) {
    const promises = pokemonNames.map(async (pokemon) => {
        const details = await getPokemonDetails(pokemon.name);
        return { id: details.id, name: details.name, image: details.image, types: details.types };
    });
    return Promise.all(promises);
}

// Lógica Principal
let offset = 0;
const limit = 10;
const pokemonListElement = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const searchInput = document.getElementById('pokemonSearchInput');
const searchButton = document.getElementById('searchButton');
const listButton = document.getElementById('listButton');
const searchResultElement = document.getElementById('searchResult');

let isSearchMode = false;

// Função para renderizar Pokémon na lista (agora adiciona event listener de clique)
function renderPokemon(pokemonData, name) {
    const pokemon = new Pokemon(pokemonData.id, pokemonData.name, pokemonData.image, pokemonData.types);
    const cardHTML = pokemon.getCardHTML(name); // Inclui data-attribute para nome
    pokemonListElement.insertAdjacentHTML('beforeend', cardHTML);
    
    // Adiciona clique no card recém-criado
    const newCard = pokemonListElement.lastElementChild;
    newCard.addEventListener('click', () => {
        console.log(`Clicou em: ${name}`); // Debug
        openPokemonDetails(name);
    });
    newCard.style.cursor = 'pointer'; // Indica clicável
}

// Nova função: Abrir detalhes ao clicar no card (similar à busca)
async function openPokemonDetails(name) {
    try {
        console.log(`Abrindo detalhes de: ${name}`); // Debug
        const details = await getPokemonDetails(name);
        
        // Limpa e mostra resultado
        clearSearchAndShowList();
        showSearchResult(details);

        // Ativa modo detalhes (esconde lista)
        isSearchMode = true;
        pokemonListElement.style.display = 'none';
        loadMoreButton.style.display = 'none';
        console.log('Modo detalhes ativado via clique'); // Debug
    } catch (error) {
        alert(error.message);
        console.error('Erro ao abrir detalhes:', error);
    }
}

// Função para mostrar resultado da tela detalhada (mantida)
function showSearchResult(pokemonData) {
    const pokemon = new Pokemon(
        pokemonData.id, 
        pokemonData.name, 
        pokemonData.image, 
        pokemonData.types, 
        pokemonData.stats, 
        pokemonData.height, 
        pokemonData.weight
    );
    
    // Aplica tema dinâmico
    const themeClass = `theme-${pokemon.primaryType}`;
    searchResultElement.className = `search-result ${themeClass}`;
    searchResultElement.innerHTML = pokemon.getSearchCardHTML();
    searchResultElement.classList.remove('hidden');
    console.log(`Tema aplicado: ${themeClass}`); // Debug
}

// Função global para voltar à lista (para botão onclick)
window.backToList = function() {
    console.log('Botão Voltar clicado'); // Debug
    clearSearchAndShowList();
};

// Função para limpar e mostrar lista (mantida)
function clearSearchAndShowList() {
    searchInput.value = '';
    searchResultElement.classList.add('hidden');
    searchResultElement.innerHTML = '';
    searchResultElement.className = 'search-result hidden';
    isSearchMode = false;
    pokemonListElement.style.display = 'grid';
    loadMoreButton.style.display = 'block';
    listButton.style.display = 'flex';
    console.log('Voltando ao modo lista'); // Debug
}

// Função de busca (mantida, agora integrada com cliques)
async function searchPokemon() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Digite um nome ou ID de Pokémon!');
        return;
    }

    try {
        console.log('Iniciando busca por:', query); // Debug
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

        const details = await getPokemonDetails(query);
        
        clearSearchAndShowList();
        showSearchResult(details);

        isSearchMode = true;
        pokemonListElement.style.display = 'none';
        loadMoreButton.style.display = 'none';
        console.log('Modo busca ativado'); // Debug
    } catch (error) {
        alert(error.message);
        console.error('Erro na busca:', error);
    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="fas fa-search"></i> Pesquisar';
    }
}

// Função para carregar batch da lista (mantida)
async function loadPokemonBatch() {
    if (isSearchMode) return;

    try {
        console.log('Carregando batch...'); // Debug
        loadMoreButton.disabled = true;
        loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';

        const pokemonList = await getPokemonList(limit, offset);
        const pokemonDetails = await getMultiplePokemonDetails(pokemonList);
        pokemonDetails.forEach((details, index) => {
            renderPokemon(details, pokemonList[index].name); // Passa name para clique
        });
        offset += limit;

        if (offset >= 1008) {
            loadMoreButton.style.display = 'none';
        }
    } catch (error) {
        alert('Erro ao carregar lista. Tente novamente.');
        console.error('Erro no load:', error);
    } finally {
        loadMoreButton.disabled = false;
        loadMoreButton.innerHTML = '<i class="fas fa-plus"></i> Load More';
    }
}

// Função para recarregar lista (usada ao voltar)
async function reloadPokemonList() {
    offset = 0;
    pokemonListElement.innerHTML = '';
    await loadPokemonBatch();
}

// Event Listeners (atualizados com suporte a cliques)
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, adicionando listeners...'); // Debug

    // Verificações de elementos
    if (!searchButton) console.error('Botão de busca não encontrado!');
    if (!listButton) console.error('Botão de lista não encontrado!');
    if (!loadMoreButton) console.error('Botão Load More não encontrado!');
    if (!searchInput) console.error('Input de busca não encontrado!');

    // Listener para busca
    if (searchButton) {
        searchButton.addEventListener('click', searchPokemon);
    }

    // Listener para Enter no input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPokemon();
        });
    }

    // Listener para "Ver Lista"
    if (listButton) {
        listButton.addEventListener('click', () => {
            console.log('Botão Ver Lista clicado'); // Debug
            clearSearchAndShowList();
            if (pokemonListElement.innerHTML === '') {
                reloadPokemonList();
            }
        });
    }

    // Listener para Load More
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadPokemonBatch);
    }

    // Carrega lista inicial
    loadPokemonBatch();
});