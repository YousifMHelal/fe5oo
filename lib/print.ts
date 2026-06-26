import { formatEGP } from "@/lib/money";

type PrintTicket = {
  id: string;
  total: number;
  note: string | null;
  createdAt: Date | string;
  cashierName?: string;
  items: {
    worker: { name: string };
    service: { title: string };
    priceSnapshot: number;
  }[];
};

export function printReceipt(ticket: PrintTicket) {
  const date = new Date(ticket.createdAt).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows = ticket.items
    .map(
      (i) => `
      <tr>
        <td>${i.service.title}</td>
        <td>${i.worker.name}</td>
        <td class="price">${formatEGP(i.priceSnapshot)}</td>
      </tr>`
    )
    .join("");

  const noteRow = ticket.note
    ? `<p class="note">ملاحظة: ${ticket.note}</p>`
    : "";

  const cashierRow = ticket.cashierName
    ? `<p class="cashier">الكاشير: ${ticket.cashierName}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>إيصال رقم ${ticket.id.slice(-6).toUpperCase()}</title>
  <style>
    @import url('data:text/css,');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Tajawal', Tahoma, Arial, sans-serif;
      font-size: 13px;
      color: #111;
      padding: 16px;
      max-width: 320px;
      margin: 0 auto;
    }
    .shop-name {
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .subtitle {
      text-align: center;
      color: #555;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .divider { border: none; border-top: 1px dashed #aaa; margin: 8px 0; }
    .meta { font-size: 11px; color: #444; margin-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 12px;
    }
    th {
      text-align: right;
      border-bottom: 1px solid #ccc;
      padding: 4px 2px;
      font-size: 11px;
      color: #555;
    }
    td { padding: 4px 2px; vertical-align: top; }
    .price { text-align: left; white-space: nowrap; }
    th:last-child { text-align: left; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 15px;
      padding: 6px 2px;
      border-top: 1px solid #ccc;
      margin-top: 4px;
    }
    .note { font-size: 11px; color: #555; margin-top: 4px; }
    .cashier { font-size: 11px; color: #555; margin-top: 2px; }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #888;
      margin-top: 12px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="shop-name">فيصو</div>
  <div class="subtitle">صالون حلاقة</div>
  <hr class="divider" />
  <p class="meta">التاريخ: ${date}</p>
  <p class="meta">رقم الإيصال: #${ticket.id.slice(-6).toUpperCase()}</p>
  ${cashierRow}
  <hr class="divider" />
  <table>
    <thead>
      <tr>
        <th>الخدمة</th>
        <th>العامل</th>
        <th style="text-align:left">السعر</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total-row">
    <span>الإجمالي</span>
    <span>${formatEGP(ticket.total)}</span>
  </div>
  ${noteRow}
  <hr class="divider" />
  <div class="footer">شكراً لزيارتكم</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=380,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
