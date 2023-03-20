# Run Express.js back-end server in development mode.
cd express-server
npm start &

# Run Flask back-end server in development mode.
cd ../flask-server
flask run

# Run React.js front-end client in development mode.
cd ../react-client
npm run build &

# TODO: How to kill background jobs on keyboard interrupt?
