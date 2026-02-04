export const parcels = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        parcelId: "PARCEL-001",
        owner: "Govt of India",
        status: "Public Land",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [78.657, 22.973],
            [78.6585, 22.973],
            [78.6585, 22.9745],
            [78.657, 22.9745],
            [78.657, 22.973],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        parcelId: "PARCEL-002",
        owner: "Amit Sharma",
        status: "Private Land",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [78.659, 22.9735],
            [78.6605, 22.9735],
            [78.6605, 22.975],
            [78.659, 22.975],
            [78.659, 22.9735],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        parcelId: "PARCEL-003",
        owner: "Rahul Vaidya",
        status: "Private Land",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [82.15144366318998, 22.07914800783146],
            [82.15245082830977, 22.07906937770547],
            [82.15246927455739, 22.078231793212176],
            [82.15148424493475, 22.078228374489782],
            [82.15144366318998, 22.07914800783146],
          ],
        ],
      },
    },
  ],
};
