-- V31: catálogo inicial de productos (RF05 - CU08 Registrar venta)
-- El orden importa: los id 1, 2 y 3 coinciden con los ejemplos de docs/api/contrato-M3.md
INSERT INTO producto (codigo, nombre, unidad_medida, precio_referencial) VALUES
    ('HIL-PIMA-301', 'Hilo de algodón Pima 30/1',              'KG', 28.50),
    ('HIL-PIMA-401', 'Hilo de algodón Pima 40/1',              'KG', 32.00),
    ('HIL-POL-402',  'Hilo poliéster 40/2',                    'KG', 18.90),
    ('HIL-TANG-301', 'Hilo de algodón Tangüis 30/1',           'KG', 22.40),
    ('HIL-MEZ-301',  'Hilo mezcla algodón/poliéster 30/1',     'KG', 20.80),
    ('HIL-ALP-228',  'Hilo de alpaca 2/28',                    'KG', 96.00);