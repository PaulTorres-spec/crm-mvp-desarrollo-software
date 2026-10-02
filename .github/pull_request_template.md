## Qué hace
<!-- Una o dos frases: qué cambia y por qué. -->

## Casos de uso / requisitos
<!-- Enlaza el Issue del CU con "Refs #N" (no uses "Closes"). El Issue se cierra cuando el CU queda Validado. -->
Refs #

## Cambios
-

## Cómo probar
<!-- Pasos para que el revisor lo compruebe. -->
1.

## Lista de verificación
- [ ] La rama sale de un `main` actualizado y su nombre sigue `tipo/RFxx-descripcion`
- [ ] Los commits siguen Conventional Commits y mencionan el CU cuando aplica
- [ ] Los checks `Backend CI` y `Frontend CI` están en verde
- [ ] Probé el cambio en mi PC (`./mvnw test` y/o `npm run build`)
- [ ] No hay secretos ni archivos `.env` en el PR (revisé *Files changed*)
- [ ] Si agregué una migración Flyway, usa un número de mi rango y no edita una ya fusionada
- [ ] Si cambié dependencias, van en un PR propio (`chore/...`)
- [ ] Actualicé la tarea en Asana (estado y horas)

## Notas para el revisor
<!-- Dudas, decisiones o partes que quieres que se miren con más cuidado. -->