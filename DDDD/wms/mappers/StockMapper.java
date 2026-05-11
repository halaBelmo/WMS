package com.example.wms.mappers;

import com.example.wms.dtos.StockRequestDTO;
import com.example.wms.dtos.StockResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.Stock;

public class StockMapper {

    public static Stock toEntity(StockRequestDTO dto, Product product, Location location) {

        Stock stock = new Stock();

        stock.setProduct(product);
        stock.setLocation(location);
        stock.setQuantity(dto.getQuantity());

        return stock;
    }

    public static StockResponseDTO toDTO(Stock stock) {

        StockResponseDTO dto = new StockResponseDTO();

        dto.setId(stock.getId());
        dto.setQuantity(stock.getQuantity());

        if (stock.getProduct() != null) {
            dto.setProductId(stock.getProduct().getId());
            dto.setProductName(stock.getProduct().getName());
        }

        if (stock.getLocation() != null) {
            dto.setLocationId(stock.getLocation().getId());
            dto.setLocationCode(stock.getLocation().getCode());
            dto.setLocationName(
                    stock.getLocation().getName() != null
                            ? stock.getLocation().getName()
                            : stock.getLocation().getCode()
            );
        }

        return dto;
    }
}
