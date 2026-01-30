# Ackordis

En app för att skapa snygga ackordblad från enkel markdown-text.

## Formatering

### Metadata (valfritt)

Lägg till information om låt och upphovsman längst upp i dokumentet med frontmatter:

```
---
Musik: Anna Andersson
Text: Bengt Bengtsson
Copyright: 2024 Musikförlaget AB
---
```

- **Musik** - Kompositören
- **Text** - Textförfattaren
- **Copyright** - Upphovsrättsinformation

Om musik och text är samma person visas "Musik & Text: [namn]" automatiskt.

---

### Titel

Använd `#` för låttiteln:

```
# Amazing Grace
```

---

### Sektioner

Använd `##` för sektionsrubriker som vers, refräng, etc:

```
## Vers 1
## Refräng
## Bro
```

---

### Ackord

Skriv ackord inom hakparenteser `[Ackord]` direkt före texten de tillhör:

```
[G]Amazing [G7]grace, how [C]sweet the [G]sound
```

Detta renderas med ackordet ovanför texten:

```
G       G7         C        G
Amazing grace, how sweet the sound
```

---

### Mellanrum med underscore

Använd `_` för att skapa extra mellanrum (1 em per underscore). Detta är användbart för att:

1. **Skapa luft före text:**
   ```
   [G]___Amazing grace
   ```
   Ger tre em mellanrum före "Amazing".

2. **Skapa luft mellan ord:**
   ```
   Hej___[C]du
   ```
   Ger mellanrum mellan "Hej" och ackordet.

3. **Skriva rader med bara ackord:**
   ```
   [C]_[D]_[Em]_[G]
   ```
   Skapar en rad med bara ackord, snyggt separerade.

---

## Komplett exempel

```
---
Musik: John Newton
Text: John Newton
Copyright: Public Domain
---

# Amazing Grace

## Vers 1
[G]___Amazing [G7]grace, how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me
I [G]once was [G7]lost, but [C]now am [G]found
Was [Em]blind, but [D]now I [G]see

## Vers 2
[G]'Twas grace that [G7]taught my [C]heart to [G]fear
And [G]grace my [Em]fears re[D]lieved
How [G]precious [G7]did that [C]grace ap[G]pear
The [Em]hour I [D]first be[G]lieved

## Outro
[C]_[D]_[Em]
[C]_[D]_[G]
```

---

## Utskrift

### Spalter

Välj antal spalter (1-3) i menyn ovanför editorn. Vid utskrift behålls antalet spalter och varje sektion (vers, refräng etc.) hålls ihop så att den inte bryts mitt i vid sidbrytning.

- **1 spalt** - Standard, bra för de flesta låtar
- **2 spalter** - Bra för kortare verser eller sångblad
- **3 spalter** - För kompakta utskrifter med många korta sektioner

### Transponering

Välj originaltonart och transponera upp eller ner. Alla ackord uppdateras automatiskt.

---

## Snabbguide

| Element | Syntax | Exempel |
|---------|--------|---------|
| Titel | `# Text` | `# Amazing Grace` |
| Sektion | `## Text` | `## Vers 1` |
| Ackord | `[Ackord]` | `[G]`, `[Am7]`, `[F#m]` |
| Mellanrum | `_` | `___` (3 em) |
| Metadata | `---`...`---` | Se ovan |
