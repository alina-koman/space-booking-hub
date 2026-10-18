# Spacebook

Застосунок для перегляду доступності кімнат і обладнання та створення бронювань.
Адмін-панель не входить у цей проєкт.

## Запуск

```bash
npm install
npm run dev
```

Перевірки перед збіркою:

```bash
npm run lint
npm run build
```

## Структура

- `src/app` — Redux store та типізовані hooks.
- `src/types` — спільні типи ресурсів і бронювань.
- `src/features/resources` — початкові ресурси й селектор фільтрації.
- `src/features/bookings` — бронювання, перевірка конфліктів, доступні слоти та форматування дат.
- `src/features/filters` — стан пошуку та фільтрів.
- `src/components/App.tsx` — компонування сторінки.
- `src/components/BookingForm.tsx` і `BookingDetailsModal.tsx` — створення та перегляд бронювань.
- `src/components/ResourceCalendar.tsx` і `ResourceFilters.tsx` — календар і фільтри ресурсів.

Дані ресурсів, бронювань і обраної дати зберігаються у `localStorage`. Якщо збережені
дані пошкоджені, застосунок повідомить про це в консолі та завантажить початкові приклади.
