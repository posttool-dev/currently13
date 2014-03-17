Vagrant::Config.run do |config|
  config.vm.box = "precise32"
  
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"

  config.vm.forward_port 80, 8080
  config.vm.forward_port 3001, 3001
  config.vm.customize ["modifyvm", :id, "--memory", 256]
  config.vm.network :hostonly, "10.11.12.23"
  #config.vm.host_name = "dragon"

  config.vm.share_folder "app", "/home/vagrant/app", "app"
  config.vm.share_folder "deploy", "/home/vagrant/deploy", "deploy"

  config.vm.provision :shell, :path => "deploy/init-app.sh"

end
