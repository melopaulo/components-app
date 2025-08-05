import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { SelectOption, SearchParams, ApiResponse } from '../components/custom-mat-select3/custom-mat-select3.component';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  
  // Dados mock para simular uma API com muitos itens
  private mockData: SelectOption[] = [
    // Países
    { value: 'br', label: 'Brasil', group: 'América do Sul' },
    { value: 'ar', label: 'Argentina', group: 'América do Sul' },
    { value: 'cl', label: 'Chile', group: 'América do Sul' },
    { value: 'co', label: 'Colômbia', group: 'América do Sul' },
    { value: 'pe', label: 'Peru', group: 'América do Sul' },
    { value: 'uy', label: 'Uruguai', group: 'América do Sul' },
    { value: 've', label: 'Venezuela', group: 'América do Sul' },
    { value: 'ec', label: 'Equador', group: 'América do Sul' },
    { value: 'bo', label: 'Bolívia', group: 'América do Sul' },
    { value: 'py', label: 'Paraguai', group: 'América do Sul' },
    
    { value: 'us', label: 'Estados Unidos', group: 'América do Norte' },
    { value: 'ca', label: 'Canadá', group: 'América do Norte' },
    { value: 'mx', label: 'México', group: 'América do Norte' },
    { value: 'gt', label: 'Guatemala', group: 'América Central' },
    { value: 'cr', label: 'Costa Rica', group: 'América Central' },
    { value: 'pa', label: 'Panamá', group: 'América Central' },
    { value: 'ni', label: 'Nicarágua', group: 'América Central' },
    { value: 'hn', label: 'Honduras', group: 'América Central' },
    { value: 'sv', label: 'El Salvador', group: 'América Central' },
    { value: 'bz', label: 'Belize', group: 'América Central' },
    
    { value: 'de', label: 'Alemanha', group: 'Europa' },
    { value: 'fr', label: 'França', group: 'Europa' },
    { value: 'it', label: 'Itália', group: 'Europa' },
    { value: 'es', label: 'Espanha', group: 'Europa' },
    { value: 'pt', label: 'Portugal', group: 'Europa' },
    { value: 'gb', label: 'Reino Unido', group: 'Europa' },
    { value: 'nl', label: 'Holanda', group: 'Europa' },
    { value: 'be', label: 'Bélgica', group: 'Europa' },
    { value: 'ch', label: 'Suíça', group: 'Europa' },
    { value: 'at', label: 'Áustria', group: 'Europa' },
    { value: 'se', label: 'Suécia', group: 'Europa' },
    { value: 'no', label: 'Noruega', group: 'Europa' },
    { value: 'dk', label: 'Dinamarca', group: 'Europa' },
    { value: 'fi', label: 'Finlândia', group: 'Europa' },
    { value: 'pl', label: 'Polônia', group: 'Europa' },
    { value: 'cz', label: 'República Tcheca', group: 'Europa' },
    { value: 'hu', label: 'Hungria', group: 'Europa' },
    { value: 'ro', label: 'Romênia', group: 'Europa' },
    { value: 'bg', label: 'Bulgária', group: 'Europa' },
    { value: 'hr', label: 'Croácia', group: 'Europa' },
    
    { value: 'cn', label: 'China', group: 'Ásia' },
    { value: 'jp', label: 'Japão', group: 'Ásia' },
    { value: 'kr', label: 'Coreia do Sul', group: 'Ásia' },
    { value: 'in', label: 'Índia', group: 'Ásia' },
    { value: 'th', label: 'Tailândia', group: 'Ásia' },
    { value: 'vn', label: 'Vietnã', group: 'Ásia' },
    { value: 'sg', label: 'Singapura', group: 'Ásia' },
    { value: 'my', label: 'Malásia', group: 'Ásia' },
    { value: 'id', label: 'Indonésia', group: 'Ásia' },
    { value: 'ph', label: 'Filipinas', group: 'Ásia' },
    { value: 'tw', label: 'Taiwan', group: 'Ásia' },
    { value: 'hk', label: 'Hong Kong', group: 'Ásia' },
    { value: 'mo', label: 'Macau', group: 'Ásia' },
    { value: 'mn', label: 'Mongólia', group: 'Ásia' },
    { value: 'kz', label: 'Cazaquistão', group: 'Ásia' },
    { value: 'uz', label: 'Uzbequistão', group: 'Ásia' },
    { value: 'kg', label: 'Quirguistão', group: 'Ásia' },
    { value: 'tj', label: 'Tadjiquistão', group: 'Ásia' },
    { value: 'tm', label: 'Turcomenistão', group: 'Ásia' },
    { value: 'af', label: 'Afeganistão', group: 'Ásia' },
    
    { value: 'au', label: 'Austrália', group: 'Oceania' },
    { value: 'nz', label: 'Nova Zelândia', group: 'Oceania' },
    { value: 'fj', label: 'Fiji', group: 'Oceania' },
    { value: 'pg', label: 'Papua Nova Guiné', group: 'Oceania' },
    { value: 'nc', label: 'Nova Caledônia', group: 'Oceania' },
    { value: 'vu', label: 'Vanuatu', group: 'Oceania' },
    { value: 'sb', label: 'Ilhas Salomão', group: 'Oceania' },
    { value: 'to', label: 'Tonga', group: 'Oceania' },
    { value: 'ws', label: 'Samoa', group: 'Oceania' },
    { value: 'ki', label: 'Kiribati', group: 'Oceania' },
    
    { value: 'za', label: 'África do Sul', group: 'África' },
    { value: 'ng', label: 'Nigéria', group: 'África' },
    { value: 'eg', label: 'Egito', group: 'África' },
    { value: 'ke', label: 'Quênia', group: 'África' },
    { value: 'ma', label: 'Marrocos', group: 'África' },
    { value: 'tn', label: 'Tunísia', group: 'África' },
    { value: 'dz', label: 'Argélia', group: 'África' },
    { value: 'ly', label: 'Líbia', group: 'África' },
    { value: 'sd', label: 'Sudão', group: 'África' },
    { value: 'et', label: 'Etiópia', group: 'África' },
    { value: 'ug', label: 'Uganda', group: 'África' },
    { value: 'tz', label: 'Tanzânia', group: 'África' },
    { value: 'mz', label: 'Moçambique', group: 'África' },
    { value: 'mg', label: 'Madagascar', group: 'África' },
    { value: 'ao', label: 'Angola', group: 'África' },
    { value: 'zm', label: 'Zâmbia', group: 'África' },
    { value: 'zw', label: 'Zimbábue', group: 'África' },
    { value: 'bw', label: 'Botsuana', group: 'África' },
    { value: 'na', label: 'Namíbia', group: 'África' },
    { value: 'sz', label: 'Suazilândia', group: 'África' }
  ];
  
  constructor() {
    // Gerar mais dados para demonstrar scroll infinito
    this.generateMoreData();
  }
  
  // Gerar dados adicionais para demonstração
  private generateMoreData() {
    const additionalData: SelectOption[] = [];
    
    // Adicionar cidades brasileiras
    const brazilianCities = [
      'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
      'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia',
      'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís',
      'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina',
      'Campo Grande', 'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa',
      'Santo André', 'Osasco', 'Jaboatão dos Guararapes', 'São José dos Campos',
      'Ribeirão Preto', 'Uberlândia', 'Contagem', 'Sorocaba', 'Aracaju',
      'Feira de Santana', 'Cuiabá', 'Joinville', 'Juiz de Fora', 'Londrina',
      'Aparecida de Goiânia', 'Niterói', 'Ananindeua', 'Belford Roxo',
      'Caxias do Sul', 'Campos dos Goytacazes', 'São João de Meriti',
      'Vila Velha', 'Florianópolis', 'Santos', 'Mauá', 'Carapicuíba',
      'Olinda', 'Diadema', 'Jundiaí', 'Piracicaba', 'Cariacica',
      'Bauru', 'Porto Velho', 'Serra', 'Betim', 'Paulista',
      'Canoas', 'Cascavel', 'Ribeirão das Neves', 'Pelotas', 'Montes Claros'
    ];
    
    brazilianCities.forEach((city, index) => {
      additionalData.push({
        value: `br_city_${index}`,
        label: `${city} - Brasil`,
        group: 'Cidades Brasileiras'
      });
    });
    
    // Adicionar empresas de tecnologia
    const techCompanies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla', 'Netflix',
      'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'NVIDIA', 'AMD',
      'Cisco', 'VMware', 'ServiceNow', 'Workday', 'Zoom', 'Slack',
      'Atlassian', 'Shopify', 'Square', 'PayPal', 'Uber', 'Airbnb',
      'Spotify', 'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat', 'TikTok',
      'Discord', 'Twitch', 'Reddit', 'GitHub', 'GitLab', 'Bitbucket',
      'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com', 'Notion',
      'Figma', 'Sketch', 'InVision', 'Canva', 'Miro', 'Lucidchart'
    ];
    
    techCompanies.forEach((company, index) => {
      additionalData.push({
        value: `tech_${index}`,
        label: company,
        group: 'Empresas de Tecnologia'
      });
    });
    
    // Adicionar linguagens de programação
    const programmingLanguages = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C',
      'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'PHP', 'Ruby', 'Scala',
      'Clojure', 'Haskell', 'Erlang', 'Elixir', 'F#', 'OCaml', 'Perl',
      'R', 'MATLAB', 'Julia', 'Lua', 'Shell', 'PowerShell', 'SQL',
      'HTML', 'CSS', 'SASS', 'LESS', 'Stylus', 'XML', 'JSON', 'YAML',
      'TOML', 'Markdown', 'LaTeX', 'Assembly', 'COBOL', 'Fortran',
      'Pascal', 'Delphi', 'Visual Basic', 'ActionScript', 'CoffeeScript'
    ];
    
    programmingLanguages.forEach((language, index) => {
      additionalData.push({
        value: `lang_${index}`,
        label: language,
        group: 'Linguagens de Programação'
      });
    });
    
    this.mockData = [...this.mockData, ...additionalData];
  }
  
  // Simular busca na API com paginação
  searchItems(params: SearchParams): Observable<ApiResponse> {
    return of(null).pipe(
      delay(Math.random() * 500 + 200), // Simular latência da rede (200-700ms)
      map(() => {
        let filteredData = [...this.mockData];
        
        // Filtrar por query se fornecida
        if (params.query && params.query.length >= 2) {
          const query = params.query.toLowerCase();
          filteredData = this.mockData.filter(item =>
            item.label.toLowerCase().includes(query) ||
            (item.group && item.group.toLowerCase().includes(query))
          );
        }
        
        // Calcular paginação
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = filteredData.slice(startIndex, endIndex);
        
        const totalItems = filteredData.length;
        const hasMore = endIndex < totalItems;
        
        return {
          items: paginatedItems,
          pagination: {
            page: params.page,
            pageSize: params.pageSize,
            totalItems,
            hasMore
          }
        };
      })
    );
  }
  
  // Buscar países especificamente
  searchCountries(params: SearchParams): Observable<ApiResponse> {
    return of(null).pipe(
      delay(Math.random() * 300 + 100),
      map(() => {
        let countries = this.mockData.filter(item => 
          item.group && ['América do Sul', 'América do Norte', 'América Central', 'Europa', 'Ásia', 'Oceania', 'África'].includes(item.group)
        );
        
        if (params.query && params.query.length >= 2) {
          const query = params.query.toLowerCase();
          countries = countries.filter(item =>
            item.label.toLowerCase().includes(query) ||
            (item.group && item.group.toLowerCase().includes(query))
          );
        }
        
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = countries.slice(startIndex, endIndex);
        
        return {
          items: paginatedItems,
          pagination: {
            page: params.page,
            pageSize: params.pageSize,
            totalItems: countries.length,
            hasMore: endIndex < countries.length
          }
        };
      })
    );
  }
  
  // Buscar cidades brasileiras
  searchBrazilianCities(params: SearchParams): Observable<ApiResponse> {
    return of(null).pipe(
      delay(Math.random() * 400 + 150),
      map(() => {
        let cities = this.mockData.filter(item => 
          item.group === 'Cidades Brasileiras'
        );
        
        if (params.query && params.query.length >= 2) {
          const query = params.query.toLowerCase();
          cities = cities.filter(item =>
            item.label.toLowerCase().includes(query)
          );
        }
        
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = cities.slice(startIndex, endIndex);
        
        return {
          items: paginatedItems,
          pagination: {
            page: params.page,
            pageSize: params.pageSize,
            totalItems: cities.length,
            hasMore: endIndex < cities.length
          }
        };
      })
    );
  }
  
  // Buscar empresas de tecnologia
  searchTechCompanies(params: SearchParams): Observable<ApiResponse> {
    return of(null).pipe(
      delay(Math.random() * 350 + 100),
      map(() => {
        let companies = this.mockData.filter(item => 
          item.group === 'Empresas de Tecnologia'
        );
        
        if (params.query && params.query.length >= 2) {
          const query = params.query.toLowerCase();
          companies = companies.filter(item =>
            item.label.toLowerCase().includes(query)
          );
        }
        
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = companies.slice(startIndex, endIndex);
        
        return {
          items: paginatedItems,
          pagination: {
            page: params.page,
            pageSize: params.pageSize,
            totalItems: companies.length,
            hasMore: endIndex < companies.length
          }
        };
      })
    );
  }
}