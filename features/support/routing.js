export default function () {
  this.Before(function() {
    this.navigateTo = (requestedRoute) => {
      return this.client.execute(function(route) {
        daedalus.actions.router.goToRoute.trigger({ route });
      }, requestedRoute);
    }
  });
}
