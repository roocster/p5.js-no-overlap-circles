# p5.js-no-overlap-circles

![alt tag](http://i.imgur.com/OqZBSYq.png)

Slightly improved algorithm for drawing non-overlapping circles
https://www.youtube.com/watch?v=XATr_jdh-44

#### Enhancements:
 - Added buffer which stores unsuitable positions to place the circle
 - Area divided into chunks

> NOTE: The position of circle is considered to be the position of its center.

### Buffer
When choosing a random position for a circle is checked whether it not will intersect with other circles. We can mark already checked coordinates by the buffer. Also after the generation a new circle (marked in blue in the picture below) the area below it (and slightly wider on MIN_R) can be marked as inaccessible for placing new circles (marked in yellow). But it is difficult to get the pixels that are included in the area of a circle. Instead, we can just mark area of the inscribed square (red hatching).

![alt tag](http://i.imgur.com/qWof6zG.png)

The size of this square may be calculated using the following formula:
```math
2a = 2 * (R + MIN_R) / sqrt(2)
```

### Chunks
Divide the area into chunks with a size of MAX_R * 2. Each new circle is added to the appropriate chunk. When checking the position  (marked in blue in the picture below), it is necessary to calculate only the distance to the circles that are in this and neighbors chunks (marked in green).

![alt tag](http://i.imgur.com/Rof2jYM.png)

#### Random position
Logically, we should choose a random position only from those that are not marked as inaccessible in the buffer. But in practice, much faster randomly select a position and check if it is not marked as inaccessible.
