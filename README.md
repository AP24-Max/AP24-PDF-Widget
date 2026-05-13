# AgrarProfiPdfWidget 2.6.0

Reines ShopBuilder-Widget für beliebig viele PDF-Dokumente aus Varianten-Eigenschaften vom Typ Datei.

## Grundprinzip

Der ShopBuilder-Reiter wird nicht vom Plugin erzeugt oder ausgeblendet. Lege im ShopBuilder den Reiter z. B. `Datenblatt/Anleitungen` fest an und platziere darin dieses Widget.

Wenn beim Artikel keine passende Datei-Eigenschaft gepflegt ist, bleibt die Widget-Ausgabe leer.

## Konfiguration

Im Feld `PDF-Dokumente / Eigenschaften` wird pro gewünschtem PDF-Button eine Zeile gepflegt:

```text
Eigenschaft-ID|Titel|Linktext
```

Beispiel:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
```

Optional kann als vierter Wert ein Eigenschaftsname als Fallback eingetragen werden:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

Der Eigenschaftsname ist normalerweise nicht nötig, wenn die Eigenschafts-ID im Frontend-Datensatz enthalten ist. Er dient nur als Fallback.

## Version 2.6.0

- Beliebig viele PDF-Kacheln über eine Konfigurationsliste.
- Keine festen Felder mehr für Bedienungsanleitung/Datenblatt.
- Keine Tab-Erzeugung und keine Tab-Ausblendung.
- Keine Manipulation von ShopBuilder-Containern, Rows oder Spalten.
- PDF-Dateien werden weiterhin aus Datei-Eigenschaften ausgelesen.
- Relative plenty-Dateipfade werden weiterhin auf die öffentliche Datei-URL normalisiert.
