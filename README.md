# E-comerce 24

Hola equipo como estan!! esta es mi prueba tecnica aqui les dejo los detalles del proyecto:
Ejecucion

```bash
npm install
npm start

## Comandos

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm test           # Tests unitarios
```

-Credenciales de prueba

```
Usuario: mor_2314
Contraseña: 83r5^_
```

- funcionalidades

- Login con autenticación JWT
- Catálogo con filtrado por categoría, búsqueda y ordenamiento
- Carrito de compras con persistencia en sesión
- Simulación de pago con formulario de tarjeta
- Diseño responsivo (móvil, tablet, desktop)
- Soporte ES/EN

 - Resumen Técnico

- **Angular 21** con standalone components (sin NgModules)
- **Signals** para estado reactivo de UI y carrito
- **RxJS** para streams HTTP y eventos asíncronos
- **Tailwind CSS 4** con design system Material Design 3
- **Lazy loading** en todas las rutas de features
- **Vitest** para testing unitario

## Estructura

```
src/app/
├── core/           # Servicios, guards, interceptors, modelos, i18n
├── features/       # auth, catalog, cart, checkout, favorites, product-detail
├── layouts/        # auth-layout, main-layout
└── shared/         # Componentes reutilizables (button, icon, skeleton, toast)
```

Mis desiciones tecnicas:


Signals vs RxJS, la separacion correcta

**Signals** para estado síncrono y local:
- Carrito (`items`, `total`, `itemCount` como `computed`)
- UI state (`isLoading`, `showPassword`, `selectedCategory`)
- Token de autenticación

**Por qué no RxJS para todo:** Las suscripciones manuales agregan boilerplate innecesario para estado que cambia de forma síncrona. Los `computed` derivan valores automáticamente sin `async pipe` ni `subscribe` en el componente.

**RxJS** solo para lo que realmente lo necesita:
- HTTP requests (`switchMap` para cancelar requests anteriores al cambiar categoría)
- `shareReplay(1)` para cachear respuestas y evitar requests duplicados
- `catchError` para manejo centralizado de errores

  - Standalone components: sin el peso de NgModules

Cada componente es autónomo con sus propios imports. Esto elimina:
- Módulos fantasma que solo re-exportan componentes
- Declaraciones duplicadas entre módulos
- El problema clásico de "dónde va este componente"

El compilador Tree-shaking elimina lo que no se usa. El build final de producción es más pequeño.


Lazy loading por feature y no por modulos

```typescript
// Cada ruta carga solo su componente
loadComponent: () => import('./features/checkout/checkout.component')
```

**Resultado:** Carga inicial de ~89KB gzipped. Cada feature se carga bajo demanda. En una app real con 50+ componentes, esto reduces el Time to Interactive de ~4s a ~1.5s.



**Por qué no class-based:** Menos boilerplate, mejor tree-shaking, y el patrón `inject()` funciona con los standalone components sin necesidad de `constructor`.


la arquitectura que utilice fue Arquitectura Core/features/Share por que:

- **Core:** Lo que cambia una vez y se usa en todo (auth, cart, i18n)
- **Features:** Lo que cambia por dominio (cada feature es un mundo)
- **Shared:** UI genérica que no conoce del negocio (button, toast, skeleton)

**La regla:** `features/` nunca importa de otro `feature/`. Solo de `core/` y `shared/`. Esto previene dependencias circulares y facilita testing.

### Tailwind + Material Design 3 tokens

En vez de usar clases hardcodeadas (`bg-blue-500`), el proyecto define tokens MD3:
```css
--color-primary: #181919
--color-secondary: #536257
```

**Beneficio:** Cambiar la paleta completa del proyecto es modificar ~10 variables CSS. Los componentes no se tocan.

- Host listener para cerrar dropdowns

```typescript
host: { '(document:click)': 'onDocumentClick($event)' }
```

En vez de injectar `DOCUMENT` y agregar listeners manuales con `DestroyRef`, Angular resuelve esto de forma declarativa. Menos código, mismo resultado.
