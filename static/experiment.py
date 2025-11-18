from rembg import remove
from PIL import Image

input_path = "NeuroLogo.png"
output_path = "NeuroLogo1.png"

img = Image.open(input_path)
output = remove(img)
output.save(output_path)
