# Amostra do GeoNames (para `--sample` e para os testes)

Estes três arquivos são **recortes literais** do dataset real do GeoNames — nenhuma
linha foi editada, só filtrada. É por isso que `node --test test/citiesRoutes.http.test.js`
exercita o mesmo parser, o mesmo esquema e o mesmo índice FTS5 que a produção,
em vez de exercitar um mock.

| arquivo | linhas | o que é |
|---|---|---|
| `cities-sample.txt` | 135 | recorte de `cities1000.txt` |
| `alternateNames-sample.txt` | 301 | recorte de `alternateNames.txt` (só pt/es/en das 135) |
| `admin1-sample.txt` | 204 | recorte de `admin1CodesASCII.txt` (BR, DE, US, JP, PT, ES, AR) |

Total: ~79 KB. Cabe no repositório sem incomodar ninguém.

## O que a amostra contém, e por quê

- **Junqueirópolis/SP** — a cidade do relato do testador (29/07/2026). É o caso que
  motivou tudo isto.
- **Junqueiro/AL** — colide no prefixo com Junqueirópolis e tem população MAIOR.
  Serve pra travar a ordenação por relevância: quem digita o nome exato tem que
  receber a cidade certa, não a mais populosa.
- **Köln/DE** — tem nome próprio nos três idiomas (Colônia / Colonia / Cologne).
  É o caso de teste multilíngue.
- **New York/US** e **Tokyo/JP** — Nova Iorque / Nueva York, Tóquio.
- **Nilópolis/RJ** e **Mesquita/MG** — o par que expõe o pior caso da ponte de
  compatibilidade (ver abaixo).
- **as 120 maiores cidades brasileiras** — volume real pros testes de limite,
  de ordenação e de busca por estado.

## Como regerar

A amostra só precisa ser regerada se o formato do GeoNames mudar (não muda faz
anos) ou se um teste novo precisar de uma cidade que não está aqui.

O gerador não vive neste diretório de propósito: ele depende dos ~210 MB de
download, que não devem existir na VPS. Rode numa máquina de desenvolvimento,
com `cities1000.zip`, `alternateNames.zip` e `admin1CodesASCII.txt` já baixados,
e recorte as linhas dos geonameids desejados. As colunas estão documentadas em
https://download.geonames.org/export/dump/readme.txt

## `../legacy-cities.json`

Snapshot dos 426 ids do `lib/cities.js` do app (o array `CITIES`), usado pra
construir a tabela `legacy_city_ids`. **Só precisa ser regerado se alguém
adicionar ou remover cidades do `lib/cities.js`** — o que, depois desta mudança,
não deveria mais acontecer: a lista estática vira uma reserva pequena e congelada.

Pra regerar, extraia o literal do array de `lib/cities.js` (é um ES module, então
não dá pra `require`) e grave como JSON. O campo `id` de cada entrada termina com
o ISO2 do país em minúsculas (`sao-paulo-br`, `bogota-co`) — a ponte depende
disso, e isso foi conferido nos 426.

## Licença

Dados do [GeoNames](https://www.geonames.org), sob
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A atribuição vai na
resposta da API (campo `attribution`) e precisa aparecer em algum lugar visível
do app.
