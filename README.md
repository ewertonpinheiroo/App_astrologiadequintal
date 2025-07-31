# Gerador de Mapa Astral

Uma aplicação web moderna e responsiva para gerar mapas astrais personalizados, desenvolvida com Next.js 14, TypeScript e integração com a API Astrológico.

![Astrological Chart Generator](https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&w=1200)

## ✨ Funcionalidades

- **Formulário Intuitivo**: Interface limpa para inserção de dados de nascimento
- **Validação Completa**: Validação em tempo real dos campos obrigatórios
- **Integração API**: Conecta-se à API Astrológico para dados precisos
- **Mapa Astral Detalhado**: Exibe posições planetárias e casas astrológicas
- **Design Responsivo**: Otimizado para dispositivos móveis, tablets e desktop
- **Tema Claro/Escuro**: Suporte completo a temas com transições suaves
- **Tratamento de Erros**: Mensagens de erro amigáveis e opções de retry

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **shadcn/ui** - Componentes UI modernos e acessíveis
- **Lucide React** - Ícones SVG otimizados
- **API Astrológico** - Serviço profissional de dados astrológicos

## 📦 Instalação

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd astrological-chart-generator
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_ASTROLOGICO_API_KEY=f843784235f84ff7ad35f3f4f85fe1136a7bb6b8ff4a2e004c4f363d
NEXT_PUBLIC_API_BASE_URL=https://api.astrologico.org/v1
```

4. **Execute o servidor de desenvolvimento**:
```bash
npm run dev
```

5. **Abra no navegador**:
Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Estrutura do Projeto

```
├── app/
│   ├── globals.css          # Estilos globais e variáveis CSS
│   ├── layout.tsx           # Layout principal da aplicação
│   └── page.tsx             # Página inicial
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── birth-data-form.tsx  # Formulário de dados de nascimento
│   ├── birth-chart-display.tsx # Exibição do mapa astral
│   ├── providers.tsx        # Provedores de contexto
│   └── theme-toggle.tsx     # Toggle de tema claro/escuro
├── hooks/
│   └── use-birth-chart.ts   # Hook personalizado para lógica do mapa
├── lib/
│   ├── astrology-api.ts     # Cliente da API Astrológico
│   ├── chart-utils.ts       # Utilitários para processamento de dados
│   └── utils.ts             # Utilitários gerais
├── types/
│   └── astrology.ts         # Definições de tipos TypeScript
└── README.md
```

## 🎯 Como Usar

1. **Preencha o Formulário**:
   - Nome completo
   - Data de nascimento
   - Horário de nascimento (preciso)
   - Cidade de nascimento
   - País de nascimento

2. **Gere o Mapa**:
   - Clique em "Gerar Mapa Astral"
   - Aguarde o processamento dos dados

3. **Visualize o Resultado**:
   - Posições planetárias com graus e signos
   - Casas astrológicas (sistema Placidus)
   - Informações técnicas do nascimento

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting do código
```

## 🌐 API Integration

A aplicação integra-se com a API Astrológico através de dois endpoints principais:

### Endpoint de Localização
```
GET /v1/location?key=API_KEY&location=CIDADE,PAÍS
```
Retorna coordenadas geográficas precisas para o local de nascimento.

### Endpoint de Mapa Astral
```
GET /v1/chart?key=API_KEY&date=TIMESTAMP&lat=LAT&lng=LNG&planets=...&houses=placidus
```
Gera o mapa astral com posições planetárias e casas astrológicas.

## 🎨 Customização de Temas

O projeto suporta temas claro e escuro com variáveis CSS personalizáveis:

```css
/* Tema Claro */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  /* ... */
}

/* Tema Escuro */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  /* ... */
}
```

## 📱 Responsividade

O design é totalmente responsivo com breakpoints otimizados:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ⚠️ Importante

- **Precisão do Horário**: Para resultados precisos, é essencial fornecer o horário exato de nascimento
- **Interpretação Profissional**: Este é um mapa básico - consulte um astrólogo profissional para interpretações completas
- **Limitações da API**: Alguns locais podem não ser encontrados - tente variações do nome da cidade

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no repositório
- Entre em contato através do e-mail do projeto

---

Desenvolvido com ❤️ usando Next.js 14 e integração com API Astrológico