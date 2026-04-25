/*
Adicionar ou ajustar no seu Config.gs:

CONFIG.SHEETS.OS = 'OS';
CONFIG.SHEETS.ITENS_OS = 'ItensOS';

CONFIG.PROP_KEYS.PDF_FOLDER_ID = 'PDF_FOLDER_ID';
CONFIG.PROP_KEYS.PDF_LOGO_FILE_ID = 'PDF_LOGO_FILE_ID';

Estrutura esperada das abas:

Clientes
- id_cliente
- nome
- telefone
- endereco
- obs
- cnpj
- status

OS
- id_os
- data
- cliente_id
- status
- descricao

ItensOS
- id_item
- os_id
- tipo
- descricao
- quantidade
- preco_unit
- total
*/
