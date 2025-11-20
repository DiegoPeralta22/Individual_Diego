// src/api/models/dailypnl.cds

namespace Daily;

// DailyPnl lógico para CAP / tipos
entity DailyPnl {
  key ID        : UUID;
      account   : String(50);
      date      : Date;
      realized  : Decimal(15,2);
      unrealized: Decimal(15,2);
      createdAt : Timestamp;
      updatedAt : Timestamp;
}
