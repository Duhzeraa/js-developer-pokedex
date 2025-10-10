// Funções para interagir com a PokeAPI
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Função para buscar a lista de Pokémon (com limite e offset para paginação)
export async function getPokemonList(limit = 10, offset = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar lista de Pokémon');
        }
        const data = await response.json();
        return data.results; // Array de { name, url }
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// Função para buscar detalhes de um Pokémon específico (usando o nome)
export async function getPokemonDetails(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);
        if (!response.ok) {
            throw new Error(`Pokémon ${name} não encontrado`);
        }
        const data = await response.json();
        
        // Extrai dados relevantes
        const id = data.id;
        const image = data.sprites.front_default || 'https://via.placeholder.com/150?text=No+Image'; // Fallback para imagem
        const types = data.types.map(typeInfo => typeInfo.type.name);
        
        return { id, name, image, types };
    } catch (error) {
        console.error(`Erro ao buscar detalhes de ${name}:`, error);
        throw error;
    }
}

// Função auxiliar para buscar múltiplos Pokémon de uma vez (para a lista)
export async function getMultiplePokemonDetails(pokemonNames) {
    const promises = pokemonNames.map(async (pokemon) => {
        const details = await getPokemonDetails(pokemon.name);
        return details;
    });
    return Promise.all(promises); // Retorna array de detalhes
}
