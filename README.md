# Educational-Presentation-Platform

## Requirments
* Python3
* Flask

To install the needed package in the requirement.txt:
```
pip install -r requirement.txt
```
## Running the platform
Clone the repository:
```
python -u app.py
```
To run the code:
```
python -u app.py
```
## Functions of each file  
app.py

The file, app.py, is the main file of this software, it uses Python combined with the Flask frame to provide a back-end logic for processing the web files in the front-end.
Besides, it also offers the database to store the information about the individual about the teachers and students. What's more, the information of the questions such as the title and the description of a question is also stored in it.

database.db

Database contains four main type of tables. First is the 'students' table, which contains the information of each student, including the id (Primary Key), name, password. The 'teachers' table have the attributes like id (Primary Key), name, password. And as a constrain, the students' name should start with 'student' and the teachers' name should start with 'teacher', which could help the back-end to distinguish which web page should be presented. There is also a table named 'questions' to collect problems published by teachers. Except the attributes of title and description, it also own an 'id' to indicate which teacher submit issue this question. Lastly, the final type of table is generated dynamically. This type of table is used to represent each questions, which means that once the teacher submit the question, a table named as the title of that question will be created, so that it could recorded the status of the response, since it have the attributes of s_id (student id who answered this question), t_id (teacher id, who publish this question), comment (the evaluation of from the teacher), answewr (the answers provided by the student), student (the name of the student), and the (s_id, t_id) is assigned as the primary key.

login.html

The login page of the platform.

register.html

The register page of the platform.

index.html

The main page of the student.

teacher.html

The main page of the teacher.

draw.html

The answer screen of the student.
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
