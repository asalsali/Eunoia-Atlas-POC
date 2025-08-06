import flwr as fl

fl.server.start_server(
    server_address="[::]:8080",
    config=fl.server.ServerConfig(num_rounds=1),
    strategy=fl.server.strategy.FedAvg(
        fraction_fit=1.0, min_fit_clients=2, min_available_clients=2
    ),
) 