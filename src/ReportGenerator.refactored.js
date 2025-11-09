class BaseReport {
  constructor(user, items) {
    this.user = user;
    this.items = items;
  }

  build() {
    let out = this.header();
    const { body, total } = this.rows();
    out += body;
    out += this.footer(total);
    return out.trim();
  }

  header() {}
  footer() {}
  renderRow() {}

  canSee(item) {
    if (this.user.role === "ADMIN") return true;
    if (this.user.role === "USER") return item.value <= 500;
    return false;
  }

  rows() {
    const visible = [];
    let total = 0;

    for (const it of this.items) {
      if (!this.canSee(it)) continue;
      visible.push(this.renderRow(it));
      total += it.value;
    }

    return { body: visible.join(""), total };
  }
}

class CsvReport extends BaseReport {
  header() {
    return "ID,NOME,VALOR,USUARIO\n";
  }

  footer(total) {
    return `\nTotal,,\n${total},,\n`;
  }

  renderRow(item) {
    return `${item.id},${item.name},${item.value},${this.user.name}\n`;
  }
}

class HtmlReport extends BaseReport {
  header() {
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${this.user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
`;
  }

  footer(total) {
    return `</table>
<h3>Total: ${total}</h3>
</body></html>
`;
  }

  renderRow(item) {
    const maybeBold =
      this.user.role === "ADMIN" && item.value > 1000
        ? ' style="font-weight:bold;"'
        : "";
    return `<tr${maybeBold}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>
`;
  }
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }
  generateReport(reportType, user, items) {
    const Impl = reportType === "CSV" ? CsvReport : HtmlReport;
    return new Impl(user, items).build();
  }
}
