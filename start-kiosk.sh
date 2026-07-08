#!/bin/bash
# Delay so GNOME session loads
sleep 5

# Disable screensaver + idle
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type 'nothing'

# Launch browser in kiosk mode
# Firefox (recommended with GNOME/Xorg):
firefox --kiosk http://localhost/monitor/#/home &
