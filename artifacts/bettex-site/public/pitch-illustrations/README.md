# Imagens conceituais do Pitch

Estas quatro imagens foram geradas por IA para ilustrar as áreas do Pitch depois do fundador. Não são fotografias de instalações, clientes ou produtos físicos reais da BETTEX.

- `pitch-economy-separation.webp`: separação entre capital da tesouraria e caixa da empresa.
- `pitch-token-participation.webp`: representação conceitual de participação por token; não representa uma moeda física emitida.
- `pitch-brazil-community.webp`: interação de uma comunidade; as pessoas retratadas não são clientes comprovados.
- `pitch-product-development.webp`: construção de produto e infraestrutura; não documenta uma instalação em operação.

Os originais estão em `attached_assets/generated_images/`, com os mesmos nomes e extensão `.jpg`. Os arquivos públicos WebP mantêm a dimensão de 1024 × 1024 pixels, com carregamento sob demanda no site.

## Heros em alta resolução

O Pitch usa variantes responsivas exclusivas de `pitch-heroes-hd/`, de 960 a 4096 pixels de largura, sem substituir os arquivos usados em outras páginas.

- As fotografias de comunidade online (Pexels), equipe (Unsplash) e Ambiente externo (Agência Brasil) usam os originais nativos maiores. O enquadramento da fotografia de Agência Brasil é preservado a partir do recorte anterior.
- As quatro ilustrações conceituais e os personagens localizados usam super-resolução FSRCNN, não regeneração de cenas. Estas versões não são originais nativos em 4K.
- As matrizes sem perdas ficam no App Storage; apenas as variantes WebP comprimidas para entrega entram no site. Os nomes incluem uma assinatura de conteúdo para invalidar versões antigas em cache.
- O gerador é `scripts/build-pitch-hero-media.py`; o modelo FSRCNN x4 vem de https://github.com/Saafke/FSRCNN_Tensorflow.