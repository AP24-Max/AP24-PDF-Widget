# AgrarProfiPdfWidget 2.8.0

Reines ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ Datei.

## Prinzip

Der Reiter `Datenblatt/Anleitungen` wird fest im ShopBuilder angelegt. Dieses Plugin erzeugt und versteckt keinen Reiter.
Das Widget gibt nur PDF-Kacheln aus. Wenn keine passenden PDF-Dateien gefunden werden, bleibt die Ausgabe leer und layoutstabil.

## Konfiguration

Eine Zeile pro Dokument:

```
Eigenschaft-ID|Titel|Linktext
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
```

Optional als 4. Wert ein Eigenschaftsname als Fallback:

```
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

## ShopBuilder

Widget in den fest angelegten Reiter `Datenblatt/Anleitungen` ziehen.
