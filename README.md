# WebGL Basketball Court - HW5

###### Group Members ############

- Shani White - 207880394   
- Daphne Messing - 

###### ######################

## How to Run the Project

1. Clone or download this repository to your local machine.
2. Ensure the folder structure is preserved (especially the `/src` directory and the basketball texture file).
3. Open `index.html` in a modern browser (e.g. Chrome) — it requires no server setup.
4. Use the mouse to explore the court interactively!

## Features Implemented

✅ Regulation-size basketball court with:
- Court floor using `BoxGeometry`
- Center line and center circle
- Two three-point arcs (left and right)

✅ Two detailed basketball hoops with:
- Transparent rectangular backboards
- Orange torus-shaped rims at regulation height (3.05m)
- Net meshes with vertical and horizontal strands
- Diagonal support arms and vertical poles

✅ Static basketball:
- Proper orange color using a custom basketball texture
- Accurate size and position (center court)
- Includes black seam lines

✅ UI Elements:
- Scoreboard placeholder (`Score: 0`)
- On-screen control instructions

✅ Lighting & Camera:
- Ambient and directional lights with shadow casting
- Initial camera positioned for court overview
- Orbit camera controls (toggle with **O** key)

## Additional features 
- More detailed court markings- Painted key area rectangles and free point line 

## Known Issues or Limitations
- The basketball uses a texture-mapped image for its visual design, not a procedurally generated or animated mesh

## External Assets Used

- [basketball.png](./src/textures/basketball.png): Used as the texture for the basketball. (Instructor-provided or CC0 licensed if sourced externally)

## Screenshots
- ✅ Overall view of the basketball court with hoops  
![](screenshots/full_court.png)
- ✅ Close-up view of basketball hoops with nets 
![](screenshots/hoops.png)
- ✅ Basketball positioned at center court  
![](screenshots/basketball.png)
- ✅ Demonstration of camera orbit functionality  
![](screenshots/orbit_demo.gif)