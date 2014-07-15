Current CMS Dev Sandbox
=======================

This is a Vagrant file and basic provisioning scripts for building a node development environment.
To get this to work, you must have VirtualBox (> 4.1.0) and Vagrant (> 1.0) installed.

    http://www.virtualbox.org
    http://www.vagrantup.com.

Once you have the pre-requisites installed, clone this repository

    git clone https://github.com/posttool/currently13.git my_current_project

and change to your new project directory to start your VM:

    cd my_current_project
    vagrant up

Note that the Vagrantfile will download and install the precise32 vagrant box if you don't already have it.

After a few minutes, you should have a virtual dev environment with node, npm, mongodb and redis.
The app folder is shared, and ports forwarding is set. This is customizable in the Vagrantfile.

You can test out your environment by ssh'ing into your environment and running the sample script:

    vagrant ssh
    cd app
    npm install
    node create_admin

It will ask you for the details like "app" that you would like to setup. Choose any any form "peter, toddhido, hackettmill, tabithasoren". After this it will ask for user name that you want to create, email id for that user, password and confirm password. This would look something like 
    
    create admin > app toddhido
    create admin > name USER_NAME
    create admin > email EMAIL
    create admin > password ******
    create admin > confirm ******
    
Press CTRL+C to exit and type following 
    
    node server1

In your browser, ```http://localhost:3001/cms```






