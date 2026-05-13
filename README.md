# AgrarProfiPdfWidget 2.7.0

Reines ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ **Datei**.

## Verwendung

Im ShopBuilder den Tab **Datenblatt/Anleitungen** fest anlegen und dieses Widget in den Tab legen.
Das Plugin erzeugt keine Tabs und blendet keine Tabs aus.

## Konfiguration

Im Feld **PDF-Dokumente / Eigenschaften** eine Zeile je PDF-Kachel pflegen:

```text
Eigenschaft-ID|Titel|Linktext
```

Beispiel:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
2040|Explosionszeichnung|Explosionszeichnung öffnen
```

Optional kann als vierter Wert ein Eigenschaftsname als Fallback ergänzt werden:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

## Änderung in 2.7.0

Diese Version ist layout-sicherer für ShopBuilder-Tabs:

- kein `hidden`-Attribut mehr auf dem Widget-Root
- keine Manipulation von Tabs, Rows, Spalten oder Content-Containern
- bei fehlenden PDF-Dateien wird nur das Widget auf 0 Höhe gesetzt
- neue Cache-Dateien: `pdf-widget-v270.js` und `pdf-widget-v270.css`
