# Educational-Presentation-Platform

## Requirments
* Python3
* Flask

To install the needed package in the requirement.txt:
```
pip install -r requirement.txt
```
## Running the platform
To run the code:
```
python -u app.py
```
## Functions of each file  
app.py

The file, app.py, is the main file of this software, it uses Python combined with the Flask frame to provide a back-end logic for processing the web files in the front-end.
Besides, it also offers the database to store the information about the individual about the teachers and students. What's more, the information of the questions such as the title and the description of a question is also stored in it.
## Catalogue Structure  
File storage complies with Flask basic requirements.
```
+-- app.py
+-- templates
|   +-- login.html
|   +-- register.html
|   +-- index.html
|   +-- teacher.html
|   +-- draw.html
+-- static
|   +-- CSS
|      +-- login.css
|      +-- register.css
|      +-- index.css
|      +-- teacher.css
|      +-- draw.css
|   +-- JS
|      +-- login.js
|      +-- register.js
|      +-- index.js
|      +-- teacher.js
|      +-- draw.js
|      +-- go.js
+-- database.db
+-- requirement.txt
+-- README.md
```
