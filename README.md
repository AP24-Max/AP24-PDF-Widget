# AgrarProfiPdfWidget 2.17.0

ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ **Datei**.

## Konfiguration

Im Feld **PDF-Dokumente / Eigenschaften** wird pro PDF eine Zeile gepflegt:

```text
Eigenschaft-ID|Titel|Linktext
```

Beispiel:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
2040|Ersatzteilliste|Ersatzteilliste öffnen
```

Optional kann als vierter Wert ein Eigenschaftsname als Fallback ergänzt werden:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

## Darstellung

Die Kachelgröße und Anzahl pro Zeile sind konfigurierbar:

- `Kacheln pro Zeile Desktop`, Standard: `4`
- `Kacheln pro Zeile Tablet`, Standard: `2`
- `Kacheln pro Zeile Mobil`, Standard: `1`
- `Kachelgröße`, Standard: `compact`; möglich: `compact`, `normal`, `large`
- `Schriftgröße Titel`, optional, z. B. `14px`
- `Schriftgröße Linktext`, optional, z. B. `12px`
- `Schriftgröße PDF-Icon`, optional, z. B. `13px`

Das Widget erzeugt keine Tabs und blendet keine ShopBuilder-Struktur aus. Der Tab **Datenblätter/Anleitungen** wird fest im ShopBuilder angelegt.

## Container-Verknüpfungen

Zusätzlich zum ShopBuilder-Widget bitte diese Container setzen:

- `PDF-Widget: Styles` → `Ceres::SingleItem.Styles`
- `PDF-Widget: Script` → `Ceres::SingleItem.AfterScriptsLoaded`


## Version 2.17.0

PropertyItems-PDFs werden fest auf `https://cdn03.plentymarkets.com/qw2mi3mfxcod/propertyItems/` normalisiert, damit Live-Links nicht mehr fälschlich über die Shop-Domain `/propertyItems/...` geöffnet werden.
