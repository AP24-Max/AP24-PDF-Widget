# AgrarProfiPdfWidget 2.10.0

ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ Datei.

## Grundprinzip

Der Tab `Datenblatt/Anleitungen` wird fest im ShopBuilder angelegt. Dieses Plugin erzeugt keinen Tab und blendet keinen Tab aus. Das Widget erzeugt ausschließlich die PDF-Kacheln innerhalb des vorhandenen ShopBuilder-Tabs.

## Wichtig in Version 2.10.0

Die CSS- und JavaScript-Dateien werden nicht mehr direkt im Widget-HTML ausgegeben. Stattdessen werden sie über Ceres-Container geladen:

- `PDF-Widget: Styles` → `Ceres::SingleItem.Styles`
- `PDF-Widget: Script` → `Ceres::SingleItem.AfterScriptsLoaded`

Dadurch landen keine `<link>`- oder `<script>`-Tags mehr im ShopBuilder-Tab-Inhalt. Das soll Layout-Probleme mit nachfolgenden Bereichen wie Kontaktformular und Footer vermeiden.

## Konfiguration

Im Feld `PDF-Dokumente / Eigenschaften` gilt: eine Zeile = eine PDF-Kachel.

Format:

```text
Eigenschaft-ID|Titel|Linktext
```

Beispiel:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
2040|Explosionszeichnung|Explosionszeichnung öffnen
```

Optional kann als vierter Wert ein Eigenschaftsname ergänzt werden:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

## ShopBuilder

Im ShopBuilder den Reiter `Datenblatt/Anleitungen` fest anlegen und in diesen Reiter das Widget `PDF-Dokumente aus Artikel-Eigenschaften` ziehen.

Wenn für einen Artikel keine passende Datei-Eigenschaft gefunden wird, bleibt der Reiter sichtbar, aber die Widget-Ausgabe bleibt leer.
